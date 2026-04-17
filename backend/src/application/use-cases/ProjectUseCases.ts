import { IProject } from '../../domain/entities/Project';
import { IProjectRepository } from '../../domain/interfaces/IProjectRepository';
import { IApiEndpointRepository } from '../../domain/interfaces/IApiEndpointRepository';
import { AppError } from '../../presentation/middleware/errorHandler';
import { generateSlug } from '../utils/slug';

export class ProjectUseCases {
  constructor(
    private projectRepo: IProjectRepository,
    private endpointRepo: IApiEndpointRepository,
  ) {}

  async listProjects(): Promise<IProject[]> {
    return this.projectRepo.findAll();
  }

  async getProject(id: string): Promise<IProject> {
    const project = await this.projectRepo.findById(id);
    if (!project) throw new AppError(404, 'Project not found');
    return project;
  }

  async createProject(data: { name: string; description?: string }): Promise<IProject> {
    const slug = generateSlug(data.name);
    const existing = await this.projectRepo.findBySlug(slug);
    if (existing) throw new AppError(409, 'Project with this name already exists');

    const apiPrefix = `${slug}/api`;
    return this.projectRepo.create({
      name: data.name,
      slug,
      description: data.description || '',
      apiPrefix,
    });
  }

  async updateProject(id: string, data: { name?: string; description?: string }): Promise<IProject> {
    const project = await this.projectRepo.findById(id);
    if (!project) throw new AppError(404, 'Project not found');

    const updateData: Partial<IProject> = {};
    if (data.name !== undefined) {
      const newSlug = generateSlug(data.name);
      const existing = await this.projectRepo.findBySlug(newSlug);
      if (existing && existing._id?.toString() !== id) {
        throw new AppError(409, 'Project with this name already exists');
      }
      updateData.name = data.name;
      updateData.slug = newSlug;
      updateData.apiPrefix = `${newSlug}/api`;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    const updated = await this.projectRepo.update(id, updateData);
    if (!updated) throw new AppError(404, 'Project not found');
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    const project = await this.projectRepo.findById(id);
    if (!project) throw new AppError(404, 'Project not found');

    await this.endpointRepo.deleteByProjectId(id);
    await this.projectRepo.delete(id);
  }
}
