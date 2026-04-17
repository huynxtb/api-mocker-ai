import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthUseCases } from '../../application/use-cases/AuthUseCases';
import { UserRepositoryImpl } from '../../infrastructure/database/repositories/UserRepositoryImpl';
import { authMiddleware } from '../middleware/authMiddleware';

const userRepo = new UserRepositoryImpl();
const authUseCases = new AuthUseCases(userRepo);
const controller = new AuthController(authUseCases);

export const authRoutes = Router();

// Public
authRoutes.get('/status', controller.status);
authRoutes.post('/register', controller.register);
authRoutes.post('/login', controller.login);
authRoutes.post('/refresh', controller.refresh);

// Protected
authRoutes.post('/logout', authMiddleware, controller.logout);
authRoutes.get('/me', authMiddleware, controller.me);
authRoutes.post('/change-password', authMiddleware, controller.changePassword);
