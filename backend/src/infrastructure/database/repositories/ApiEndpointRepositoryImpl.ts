import { IApiEndpoint } from '../../../domain/entities/ApiEndpoint';
import { IApiEndpointRepository } from '../../../domain/interfaces/IApiEndpointRepository';
import { ApiEndpointModel } from '../models/ApiEndpointModel';

export class ApiEndpointRepositoryImpl implements IApiEndpointRepository {
  async findByProjectId(projectId: string): Promise<IApiEndpoint[]> {
    return ApiEndpointModel.find({ projectId }).sort({ createdAt: 1 }).lean();
  }

  async findById(id: string): Promise<IApiEndpoint | null> {
    return ApiEndpointModel.findById(id).lean();
  }

  async findByFullPathAndMethod(fullPath: string, method: string): Promise<IApiEndpoint | null> {
    return ApiEndpointModel.findOne({ fullPath, httpMethod: method }).lean();
  }

  async create(endpoint: Partial<IApiEndpoint>): Promise<IApiEndpoint> {
    const doc = await ApiEndpointModel.create(endpoint);
    return doc.toObject();
  }

  async createMany(endpoints: Partial<IApiEndpoint>[]): Promise<IApiEndpoint[]> {
    const docs = await ApiEndpointModel.insertMany(endpoints);
    return docs.map((d) => d.toObject());
  }

  async update(id: string, endpoint: Partial<IApiEndpoint>): Promise<IApiEndpoint | null> {
    return ApiEndpointModel.findByIdAndUpdate(id, endpoint, { new: true }).lean();
  }

  async delete(id: string): Promise<boolean> {
    const result = await ApiEndpointModel.findByIdAndDelete(id);
    return result !== null;
  }

  async deleteByProjectId(projectId: string): Promise<boolean> {
    const result = await ApiEndpointModel.deleteMany({ projectId });
    return result.deletedCount > 0;
  }

  async deleteByProjectIdAndBasePath(projectId: string, basePath: string): Promise<number> {
    const result = await ApiEndpointModel.deleteMany({ projectId, basePath });
    return result.deletedCount ?? 0;
  }
}
