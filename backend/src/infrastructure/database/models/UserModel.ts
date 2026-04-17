import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../../../domain/entities/User';

export interface UserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    refreshTokenHash: { type: String, default: '' },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
