import { IUser } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { UserModel } from '../models/UserModel';

export class UserRepositoryImpl implements IUserRepository {
  async count(): Promise<number> {
    return UserModel.countDocuments();
  }

  async findByUsername(username: string): Promise<IUser | null> {
    const user = await UserModel.findOne({ username }).lean();
    return user ? (user as unknown as IUser) : null;
  }

  async findById(id: string): Promise<IUser | null> {
    const user = await UserModel.findById(id).lean();
    return user ? (user as unknown as IUser) : null;
  }

  async create(data: Pick<IUser, 'username' | 'passwordHash'>): Promise<IUser> {
    const doc = await UserModel.create({ ...data, refreshTokenHash: '' });
    return doc.toObject() as unknown as IUser;
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await UserModel.updateOne({ _id: id }, { passwordHash, refreshTokenHash: '' });
  }

  async updateRefreshToken(id: string, refreshTokenHash: string): Promise<void> {
    await UserModel.updateOne({ _id: id }, { refreshTokenHash });
  }

  async clearRefreshToken(id: string): Promise<void> {
    await UserModel.updateOne({ _id: id }, { refreshTokenHash: '' });
  }
}
