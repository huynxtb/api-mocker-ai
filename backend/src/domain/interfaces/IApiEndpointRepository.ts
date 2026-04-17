import { IApiEndpoint } from '../entities/ApiEndpoint';

export interface IApiEndpointRepository {
  findByProjectId(projectId: string): Promise<IApiEndpoint[]>;
  findById(id: string): Promise<IApiEndpoint | null>;
  findByFullPathAndMethod(fullPath: string, method: string): Promise<IApiEndpoint | null>;
  create(endpoint: Partial<IApiEndpoint>): Promise<IApiEndpoint>;
  createMany(endpoints: Partial<IApiEndpoint>[]): Promise<IApiEndpoint[]>;
  update(id: string, endpoint: Partial<IApiEndpoint>): Promise<IApiEndpoint | null>;
  delete(id: string): Promise<boolean>;
  deleteByProjectId(projectId: string): Promise<boolean>;
  deleteByProjectIdAndBasePath(projectId: string, basePath: string): Promise<number>;
}
