import { IProject } from '../../../domain/entities/Project';
import { IProjectRepository } from '../../../domain/interfaces/IProjectRepository';
import { ProjectModel } from '../models/ProjectModel';

export class ProjectRepositoryImpl implements IProjectRepository {
  async findAll(): Promise<IProject[]> {
    return ProjectModel.find().sort({ createdAt: -1 }).lean();
  }

  async findById(id: string): Promise<IProject | null> {
    return ProjectModel.findById(id).lean();
  }

  async findBySlug(slug: string): Promise<IProject | null> {
    return ProjectModel.findOne({ slug }).lean();
  }

  async create(project: Partial<IProject>): Promise<IProject> {
    const doc = await ProjectModel.create(project);
    return doc.toObject();
  }

  async update(id: string, project: Partial<IProject>): Promise<IProject | null> {
    return ProjectModel.findByIdAndUpdate(id, project, { new: true }).lean();
  }

  async delete(id: string): Promise<boolean> {
    const result = await ProjectModel.findByIdAndDelete(id);
    return result !== null;
  }
}
