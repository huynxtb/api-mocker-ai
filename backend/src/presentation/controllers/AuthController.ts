import { Request, Response, NextFunction } from 'express';
import { AuthUseCases } from '../../application/use-cases/AuthUseCases';
import { AppError } from '../middleware/errorHandler';

export class AuthController {
  constructor(private authUseCases: AuthUseCases) {}

  status = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const hasAccount = await this.authUseCases.hasAccount();
      res.json({ success: true, data: { hasAccount } });
    } catch (err) { next(err); }
  };

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;
      const result = await this.authUseCases.registerSystemAccount(username, password);
      res.status(201).json({ success: true, data: result });
    } catch (err) { next(err); }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;
      const result = await this.authUseCases.login(username, password);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const result = await this.authUseCases.refresh(refreshToken);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, 'Unauthorized');
      await this.authUseCases.logout(userId);
      res.json({ success: true });
    } catch (err) { next(err); }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, 'Unauthorized');
      const user = await this.authUseCases.getUserById(userId);
      if (!user) throw new AppError(404, 'User not found');
      res.json({ success: true, data: user });
    } catch (err) { next(err); }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, 'Unauthorized');
      const { currentPassword, newPassword } = req.body;
      await this.authUseCases.changePassword(userId, currentPassword, newPassword);
      res.json({ success: true });
    } catch (err) { next(err); }
  };
}
