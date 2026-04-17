import mongoose, { Schema, Document } from 'mongoose';
import { IProject } from '../../../domain/entities/Project';

export interface ProjectDocument extends Omit<IProject, '_id'>, Document {}

const ProjectSchema = new Schema<ProjectDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    apiPrefix: { type: String, required: true },
  },
  { timestamps: true },
);

export const ProjectModel = mongoose.model<ProjectDocument>('Project', ProjectSchema);
