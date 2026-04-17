export interface IUser {
  _id?: unknown;
  username: string;
  passwordHash: string;
  refreshTokenHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}
