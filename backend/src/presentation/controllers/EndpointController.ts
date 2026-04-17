import { Request, Response, NextFunction } from 'express';
import { EndpointUseCases } from '../../application/use-cases/EndpointUseCases';

export class EndpointController {
  constructor(private endpointUseCases: EndpointUseCases) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const endpoints = await this.endpointUseCases.listEndpoints(req.params.projectId as string);
      res.json({ success: true, data: endpoints });
    } catch (err) { next(err); }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const endpoint = await this.endpointUseCases.getEndpoint(req.params.id as string);
      res.json({ success: true, data: endpoint });
    } catch (err) { next(err); }
  };

  createResource = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const endpoints = await this.endpointUseCases.createApiResource(req.params.projectId as string, req.body);
      res.status(201).json({ success: true, data: endpoints });
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const endpoint = await this.endpointUseCases.updateEndpoint(req.params.id as string, req.body);
      res.json({ success: true, data: endpoint });
    } catch (err) { next(err); }
  };

  addEndpoint = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const endpoint = await this.endpointUseCases.addEndpoint(req.params.projectId as string, req.body);
      res.status(201).json({ success: true, data: endpoint });
    } catch (err) { next(err); }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.endpointUseCases.deleteEndpoint(req.params.id as string);
      res.json({ success: true, message: 'Endpoint deleted' });
    } catch (err) { next(err); }
  };

  deleteResource = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.params.projectId as string;
      const basePath = decodeURIComponent(req.params.basePath as string);
      const result = await this.endpointUseCases.deleteApiResource(projectId, basePath);
      res.json({ success: true, message: 'Resource deleted', data: result });
    } catch (err) { next(err); }
  };
}
