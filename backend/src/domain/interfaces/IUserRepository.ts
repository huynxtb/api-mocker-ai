import { IUser } from '../entities/User';

export interface IUserRepository {
  count(): Promise<number>;
  findByUsername(username: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  create(data: Pick<IUser, 'username' | 'passwordHash'>): Promise<IUser>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
  updateRefreshToken(id: string, refreshTokenHash: string): Promise<void>;
  clearRefreshToken(id: string): Promise<void>;
}
