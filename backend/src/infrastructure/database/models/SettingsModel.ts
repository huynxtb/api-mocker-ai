import mongoose, { Schema, Document } from 'mongoose';
import { ISettings, AiAccount } from '../../../domain/entities/Settings';

export interface SettingsDocument extends Omit<ISettings, '_id'>, Document {}

const AiAccountSchema = new Schema<AiAccount>(
  {
    id: { type: String, required: true },
    provider: { type: String, enum: ['openai', 'gemini', 'grok'], required: true },
    label: { type: String, default: '' },
    apiKey: { type: String, default: '' },
    model: { type: String, default: '' },
  },
  { _id: false },
);

const SettingsSchema = new Schema<SettingsDocument>(
  {
    accounts: { type: [AiAccountSchema], default: [] },
    primaryAccountId: { type: String, default: '' },
    fallbackAccountIds: { type: [String], default: [] },
  },
  { timestamps: true, strict: false },
);

export const SettingsModel = mongoose.model<SettingsDocument>('Settings', SettingsSchema);
