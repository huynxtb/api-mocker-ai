import { Router, Request, Response, NextFunction } from 'express';
import { EndpointController } from '../controllers/EndpointController';
import { EndpointUseCases } from '../../application/use-cases/EndpointUseCases';
import { GenerateDataUseCase } from '../../application/use-cases/GenerateDataUseCase';
import { ApiEndpointRepositoryImpl } from '../../infrastructure/database/repositories/ApiEndpointRepositoryImpl';
import { ProjectRepositoryImpl } from '../../infrastructure/database/repositories/ProjectRepositoryImpl';
import { SettingsRepositoryImpl } from '../../infrastructure/database/repositories/SettingsRepositoryImpl';

const endpointRepo = new ApiEndpointRepositoryImpl();
const projectRepo = new ProjectRepositoryImpl();
const settingsRepo = new SettingsRepositoryImpl();
const endpointUseCases = new EndpointUseCases(endpointRepo, projectRepo);
const generateDataUseCase = new GenerateDataUseCase(endpointRepo, settingsRepo, projectRepo);
const controller = new EndpointController(endpointUseCases);

export const endpointRoutes = Router();

endpointRoutes.get('/:projectId/endpoints', controller.list);
endpointRoutes.get('/:projectId/endpoints/:id', controller.get);
endpointRoutes.post('/:projectId/endpoints', controller.createResource);
endpointRoutes.post('/:projectId/endpoints/add', controller.addEndpoint);
endpointRoutes.put('/:projectId/endpoints/:id', controller.update);
endpointRoutes.delete('/:projectId/endpoints/:id', controller.delete);
endpointRoutes.delete('/:projectId/resources/:basePath', controller.deleteResource);

// Save + Generate data via AI (merged)
endpointRoutes.post('/:projectId/endpoints/:id/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const endpoint = await generateDataUseCase.execute(req.params.id as string, req.body);
    res.json({ success: true, data: endpoint });
  } catch (err) { next(err); }
});
