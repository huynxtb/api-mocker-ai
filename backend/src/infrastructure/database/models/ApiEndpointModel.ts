import mongoose, { Schema, Document } from 'mongoose';
import { IApiEndpoint } from '../../../domain/entities/ApiEndpoint';

export interface ApiEndpointDocument extends Omit<IApiEndpoint, '_id'>, Document {}

const PaginationConfigSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    pageKey: { type: String, default: 'page' },
    limitKey: { type: String, default: 'limit' },
    totalKey: { type: String, default: 'total' },
    dataKey: { type: String, default: 'data' },
    defaultLimit: { type: Number, default: 10 },
  },
  { _id: false },
);

const ApiEndpointSchema = new Schema<ApiEndpointDocument>(
  {
    projectId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    basePath: { type: String, required: true },
    customEndpoint: { type: String, default: '' },
    fullPath: { type: String, required: true },
    httpMethod: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      required: true,
    },
    statusCode: { type: Number, default: 200 },
    responseStructure: { type: String, default: '' },
    generatedData: { type: Schema.Types.Mixed, default: null },
    aiPrompt: { type: String, default: '' },
    itemCount: { type: Number, default: 15, min: 1, max: 50 },
    isList: { type: Boolean, default: false },
    idField: { type: String, default: '' },
    paginationConfig: { type: PaginationConfigSchema, default: null },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

ApiEndpointSchema.index({ fullPath: 1, httpMethod: 1 });

export const ApiEndpointModel = mongoose.model<ApiEndpointDocument>('ApiEndpoint', ApiEndpointSchema);
