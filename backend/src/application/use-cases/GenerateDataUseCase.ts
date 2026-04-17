import { IApiEndpoint } from '../../domain/entities/ApiEndpoint';
import { AiAccount } from '../../domain/entities/Settings';
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
    if (updateData?.customEndpoint !== undefined) {
      const existing = await this.endpointRepo.findById(endpointId);
      if (!existing) throw new AppError(404, 'Endpoint not found');
      const project = await this.projectRepo.findById(existing.projectId);
      if (!project) throw new AppError(404, 'Project not found');
      updateData.fullPath = `${project.apiPrefix}/${existing.basePath}${updateData.customEndpoint ? '/' + updateData.customEndpoint : ''}`;
    }

    let endpoint: IApiEndpoint | null;
    if (updateData && Object.keys(updateData).length > 0) {
      endpoint = await this.endpointRepo.update(endpointId, updateData);
      if (!endpoint) throw new AppError(404, 'Endpoint not found');
    } else {
      endpoint = await this.endpointRepo.findById(endpointId);
      if (!endpoint) throw new AppError(404, 'Endpoint not found');
    }

    if (!endpoint.responseStructure) {
      return endpoint;
    }

    const settings = await this.settingsRepo.get();
    const chain = buildChain(settings.accounts, settings.primaryAccountId, settings.fallbackAccountIds);
    if (chain.length === 0) {
      throw new AppError(400, 'No AI account is configured. Add an account and pick a primary on the Settings page.');
    }

    const isList = endpoint.isList;

    let lastError: unknown = null;
    for (const account of chain) {
      try {
        const provider = AiProviderFactory.create(account.provider, account.apiKey, account.model);
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
      } catch (err) {
        lastError = err;
        console.warn(
          `[GenerateData] account ${account.label || account.id} (${account.provider}) failed, trying next in chain`,
          err instanceof Error ? err.message : err,
        );
      }
    }

    const message = lastError instanceof Error ? lastError.message : 'All AI accounts in the fallback chain failed';
    throw new AppError(502, `All AI accounts failed. Last error: ${message}`);
  }
}

function buildChain(accounts: AiAccount[], primaryId: string, fallbackIds: string[]): AiAccount[] {
  const byId = new Map(accounts.map((a) => [a.id, a]));
  const ids = [primaryId, ...fallbackIds].filter((id) => id);
  const seen = new Set<string>();
  const chain: AiAccount[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const account = byId.get(id);
    if (account && account.apiKey) chain.push(account);
  }
  return chain;
}
