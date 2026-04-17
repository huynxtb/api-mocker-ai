import { IProject } from '../entities/Project';

export interface IProjectRepository {
  findAll(): Promise<IProject[]>;
  findById(id: string): Promise<IProject | null>;
  findBySlug(slug: string): Promise<IProject | null>;
  create(project: Partial<IProject>): Promise<IProject>;
  update(id: string, project: Partial<IProject>): Promise<IProject | null>;
  delete(id: string): Promise<boolean>;
}
