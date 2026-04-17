import { IApiEndpoint } from '../../domain/entities/ApiEndpoint';
import { IApiEndpointRepository } from '../../domain/interfaces/IApiEndpointRepository';
import { IProjectRepository } from '../../domain/interfaces/IProjectRepository';
import { ISettingsRepository } from '../../domain/interfaces/ISettingsRepository';
import { AiProviderFactory } from '../../infrastructure/ai-providers/AiProviderFactory';
import { AppError } from '../../presentation/middleware/errorHandler';

export class GenerateDataUseCase {
  constructor(
    private endpointRepo: IApiEndpointRepository,
    private settingsRepo: ISettingsRepository,
    private projectRepo: IProjectRepository,
  ) {}

  async execute(endpointId: string, updateData?: Partial<IApiEndpoint>): Promise<IApiEndpoint> {
    // Step 1: Recalculate fullPath if customEndpoint changed
    if (updateData?.customEndpoint !== undefined) {
      const existing = await this.endpointRepo.findById(endpointId);
      if (!existing) throw new AppError(404, 'Endpoint not found');
      const project = await this.projectRepo.findById(existing.projectId);
      if (!project) throw new AppError(404, 'Project not found');
      updateData.fullPath = `${project.apiPrefix}/${existing.basePath}${updateData.customEndpoint ? '/' + updateData.customEndpoint : ''}`;
    }

    // Step 2: Save endpoint updates first (merged save+generate)
    let endpoint: IApiEndpoint | null;
    if (updateData && Object.keys(updateData).length > 0) {
      endpoint = await this.endpointRepo.update(endpointId, updateData);
      if (!endpoint) throw new AppError(404, 'Endpoint not found');
    } else {
      endpoint = await this.endpointRepo.findById(endpointId);
      if (!endpoint) throw new AppError(404, 'Endpoint not found');
    }

    // If no response structure, just save without generating
    if (!endpoint.responseStructure) {
      return endpoint;
    }

    const settings = await this.settingsRepo.get();
    const apiKeyMap: Record<string, string> = {
      openai: settings.openaiApiKey,
      gemini: settings.geminiApiKey,
      grok: settings.grokApiKey,
    };

    const apiKey = apiKeyMap[settings.aiProvider];
    if (!apiKey) throw new AppError(400, `API key not configured for ${settings.aiProvider}`);

    const modelMap: Record<string, string> = {
      openai: settings.openaiModel,
      gemini: settings.geminiModel,
      grok: settings.grokModel,
    };
    const provider = AiProviderFactory.create(settings.aiProvider, apiKey, modelMap[settings.aiProvider]);

    const isList = endpoint.isList;

    const generatedData = await provider.generateMockData(
      endpoint.responseStructure,
      isList ? endpoint.itemCount : 1,
      endpoint.aiPrompt,
      isList,
      endpoint.idField || undefined,
    );

    const updated = await this.endpointRepo.update(endpointId, { generatedData });
    if (!updated) throw new AppError(500, 'Failed to save generated data');

    return updated;
  }
}
