import { IUser } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { hashPassword, comparePassword } from '../../infrastructure/auth/password';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../../infrastructure/auth/jwt';
import { AppError } from '../../presentation/middleware/errorHandler';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: { id: string; username: string };
}

export class AuthUseCases {
  constructor(private userRepo: IUserRepository) {}

  async hasAccount(): Promise<boolean> {
    const count = await this.userRepo.count();
    return count > 0;
  }

  async registerSystemAccount(username: string, password: string): Promise<AuthResult> {
    if (!username || !password) {
      throw new AppError(400, 'Username and password are required');
    }
    if (password.length < 6) {
      throw new AppError(400, 'Password must be at least 6 characters');
    }
    const existing = await this.userRepo.count();
    if (existing > 0) {
      throw new AppError(403, 'System account already exists');
    }
    const passwordHash = await hashPassword(password);
    const user = await this.userRepo.create({ username: username.trim(), passwordHash });
    return this.issueTokens(user);
  }

  async login(username: string, password: string): Promise<AuthResult> {
    if (!username || !password) {
      throw new AppError(400, 'Username and password are required');
    }
    const user = await this.userRepo.findByUsername(username.trim());
    if (!user) throw new AppError(401, 'Invalid credentials');
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) throw new AppError(401, 'Invalid credentials');
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) throw new AppError(401, 'Missing refresh token');
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(401, 'Invalid refresh token');
    }
    const user = await this.userRepo.findById(payload.sub);
    if (!user) throw new AppError(401, 'User not found');
    const providedHash = hashToken(refreshToken);
    if (!user.refreshTokenHash || user.refreshTokenHash !== providedHash) {
      throw new AppError(401, 'Refresh token revoked');
    }
    const accessToken = signAccessToken({ sub: String(user._id), username: user.username });
    return { accessToken, refreshToken };
  }

  async logout(userId: string): Promise<void> {
    await this.userRepo.clearRefreshToken(userId);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    if (!currentPassword || !newPassword) {
      throw new AppError(400, 'Current and new password are required');
    }
    if (newPassword.length < 6) {
      throw new AppError(400, 'Password must be at least 6 characters');
    }
    const user = await this.userRepo.findById(userId);
    if (!user) throw new AppError(404, 'User not found');
    const ok = await comparePassword(currentPassword, user.passwordHash);
    if (!ok) throw new AppError(401, 'Current password is incorrect');
    const passwordHash = await hashPassword(newPassword);
    await this.userRepo.updatePassword(userId, passwordHash);
  }

  async getUserById(userId: string): Promise<{ id: string; username: string } | null> {
    const user = await this.userRepo.findById(userId);
    if (!user) return null;
    return { id: String(user._id), username: user.username };
  }

  private async issueTokens(user: IUser): Promise<AuthResult> {
    const id = String(user._id);
    const accessToken = signAccessToken({ sub: id, username: user.username });
    const refreshToken = signRefreshToken({ sub: id, username: user.username });
    await this.userRepo.updateRefreshToken(id, hashToken(refreshToken));
    return {
      accessToken,
      refreshToken,
      user: { id, username: user.username },
    };
  }
}
