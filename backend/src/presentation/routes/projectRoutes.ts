import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { ProjectUseCases } from '../../application/use-cases/ProjectUseCases';
import { ProjectRepositoryImpl } from '../../infrastructure/database/repositories/ProjectRepositoryImpl';
import { ApiEndpointRepositoryImpl } from '../../infrastructure/database/repositories/ApiEndpointRepositoryImpl';

const projectRepo = new ProjectRepositoryImpl();
const endpointRepo = new ApiEndpointRepositoryImpl();
const projectUseCases = new ProjectUseCases(projectRepo, endpointRepo);
const controller = new ProjectController(projectUseCases);

export const projectRoutes = Router();

projectRoutes.get('/', controller.list);
projectRoutes.get('/:id', controller.get);
projectRoutes.post('/', controller.create);
projectRoutes.put('/:id', controller.update);
projectRoutes.delete('/:id', controller.delete);
