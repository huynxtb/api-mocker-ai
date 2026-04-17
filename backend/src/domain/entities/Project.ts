export interface IProject {
  _id?: unknown;
  name: string;
  slug: string;
  description: string;
  apiPrefix: string;
  createdAt?: Date;
  updatedAt?: Date;
}
