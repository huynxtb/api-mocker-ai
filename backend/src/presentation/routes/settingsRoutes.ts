import { Router } from 'express';
import { SettingsController } from '../controllers/SettingsController';
import { SettingsUseCases } from '../../application/use-cases/SettingsUseCases';
import { SettingsRepositoryImpl } from '../../infrastructure/database/repositories/SettingsRepositoryImpl';

const settingsRepo = new SettingsRepositoryImpl();
const settingsUseCases = new SettingsUseCases(settingsRepo);
const controller = new SettingsController(settingsUseCases);

export const settingsRoutes = Router();

settingsRoutes.get('/', controller.get);
settingsRoutes.put('/', controller.update);
