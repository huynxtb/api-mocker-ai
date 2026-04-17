import { Request, Response, NextFunction } from 'express';
import { ProjectUseCases } from '../../application/use-cases/ProjectUseCases';

export class ProjectController {
  constructor(private projectUseCases: ProjectUseCases) {}

  list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await this.projectUseCases.listProjects();
      res.json({ success: true, data: projects });
    } catch (err) { next(err); }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await this.projectUseCases.getProject(req.params.id as string);
      res.json({ success: true, data: project });
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await this.projectUseCases.createProject(req.body);
      res.status(201).json({ success: true, data: project });
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await this.projectUseCases.updateProject(req.params.id as string, req.body);
      res.json({ success: true, data: project });
    } catch (err) { next(err); }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.projectUseCases.deleteProject(req.params.id as string);
      res.json({ success: true, message: 'Project deleted' });
    } catch (err) { next(err); }
  };
}
