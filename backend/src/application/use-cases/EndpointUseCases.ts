import { IApiEndpoint, DEFAULT_ENDPOINTS } from '../../domain/entities/ApiEndpoint';
import { IApiEndpointRepository } from '../../domain/interfaces/IApiEndpointRepository';
import { IProjectRepository } from '../../domain/interfaces/IProjectRepository';
import { AppError } from '../../presentation/middleware/errorHandler';
import { normalizeEndpoint } from '../utils/slug';

export class EndpointUseCases {
  constructor(
    private endpointRepo: IApiEndpointRepository,
    private projectRepo: IProjectRepository,
  ) {}

  async listEndpoints(projectId: string): Promise<IApiEndpoint[]> {
    return this.endpointRepo.findByProjectId(projectId);
  }

  async getEndpoint(id: string): Promise<IApiEndpoint> {
    const endpoint = await this.endpointRepo.findById(id);
    if (!endpoint) throw new AppError(404, 'Endpoint not found');
    return endpoint;
  }

  async createApiResource(
    projectId: string,
    data: { name: string; description?: string; baseEndpoint?: string; isCustomEndpoint?: boolean },
  ): Promise<IApiEndpoint[]> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new AppError(404, 'Project not found');

    const basePath = data.isCustomEndpoint && data.baseEndpoint
      ? data.baseEndpoint
      : normalizeEndpoint(data.name);

    const endpoints: Partial<IApiEndpoint>[] = DEFAULT_ENDPOINTS.map((def) => ({
      projectId,
      name: `${data.name} - ${def.name}`,
      description: data.description || '',
      basePath,
      customEndpoint: def.suffix,
      fullPath: `${project.apiPrefix}/${basePath}${def.suffix ? '/' + def.suffix : ''}`,
      httpMethod: def.method,
      statusCode: def.method === 'DELETE' ? 204 : 200,
      responseStructure: '',
      generatedData: null,
      aiPrompt: '',
      itemCount: 15,
      isList: def.name === 'List',
      idField: '',
      paginationConfig: def.name === 'List'
        ? { enabled: true, pageKey: 'page', limitKey: 'limit', totalKey: 'total', dataKey: 'data', defaultLimit: 10 }
        : null,
      isDefault: def.isDefault,
    }));

    return this.endpointRepo.createMany(endpoints);
  }

  async updateEndpoint(id: string, data: Partial<IApiEndpoint>): Promise<IApiEndpoint> {
    const endpoint = await this.endpointRepo.findById(id);
    if (!endpoint) throw new AppError(404, 'Endpoint not found');

    const project = await this.projectRepo.findById(endpoint.projectId);
    if (!project) throw new AppError(404, 'Project not found');

    const updateData: Partial<IApiEndpoint> = {};

    if (data.customEndpoint !== undefined) {
      const cleaned = data.customEndpoint.replace(/^\/+/, '');
      updateData.customEndpoint = cleaned;
      updateData.fullPath = `${project.apiPrefix}/${endpoint.basePath}${cleaned ? '/' + cleaned : ''}`;
    }
    if (data.httpMethod !== undefined) updateData.httpMethod = data.httpMethod;
    if (data.statusCode !== undefined) updateData.statusCode = data.statusCode;
    if (data.responseStructure !== undefined) updateData.responseStructure = data.responseStructure;
    if (data.aiPrompt !== undefined) updateData.aiPrompt = data.aiPrompt;
    if (data.itemCount !== undefined) updateData.itemCount = Math.min(50, Math.max(1, data.itemCount));
    if (data.isList !== undefined) updateData.isList = data.isList;
    if (data.idField !== undefined) updateData.idField = data.idField;
    if (data.paginationConfig !== undefined) updateData.paginationConfig = data.paginationConfig;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.generatedData !== undefined) updateData.generatedData = data.generatedData;

    const updated = await this.endpointRepo.update(id, updateData);
    if (!updated) throw new AppError(404, 'Endpoint not found');
    return updated;
  }

  async addEndpoint(
    projectId: string,
    data: {
      name: string;
      description?: string;
      basePath: string;
      customEndpoint?: string;
      httpMethod: string;
      statusCode?: number;
      responseStructure?: string;
    },
  ): Promise<IApiEndpoint> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new AppError(404, 'Project not found');

    const customEndpoint = (data.customEndpoint || '').replace(/^\/+/, '');
    const fullPath = `${project.apiPrefix}/${data.basePath}${customEndpoint ? '/' + customEndpoint : ''}`;

    return this.endpointRepo.create({
      projectId,
      name: data.name,
      description: data.description || '',
      basePath: data.basePath,
      customEndpoint,
      fullPath,
      httpMethod: data.httpMethod as IApiEndpoint['httpMethod'],
      statusCode: data.statusCode || 200,
      responseStructure: data.responseStructure || '',
      generatedData: null,
      aiPrompt: '',
      itemCount: 15,
      paginationConfig: null,
      isDefault: false,
    });
  }

  async deleteEndpoint(id: string): Promise<void> {
    const endpoint = await this.endpointRepo.findById(id);
    if (!endpoint) throw new AppError(404, 'Endpoint not found');
    await this.endpointRepo.delete(id);
  }

  async deleteApiResource(projectId: string, basePath: string): Promise<{ deletedCount: number }> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new AppError(404, 'Project not found');

    const deletedCount = await this.endpointRepo.deleteByProjectIdAndBasePath(projectId, basePath);
    if (deletedCount === 0) throw new AppError(404, 'Resource not found');
    return { deletedCount };
  }
}
