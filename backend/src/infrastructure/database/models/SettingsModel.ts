import mongoose, { Schema, Document } from 'mongoose';
import { ISettings } from '../../../domain/entities/Settings';

export interface SettingsDocument extends Omit<ISettings, '_id'>, Document {}

const SettingsSchema = new Schema<SettingsDocument>(
  {
    aiProvider: { type: String, default: 'openai' },
    openaiApiKey: { type: String, default: '' },
    geminiApiKey: { type: String, default: '' },
    grokApiKey: { type: String, default: '' },
    openaiModel: { type: String, default: 'gpt-4o-mini' },
    geminiModel: { type: String, default: 'gemini-1.5-flash' },
    grokModel: { type: String, default: 'grok-2-latest' },
  },
  { timestamps: true },
);

export const SettingsModel = mongoose.model<SettingsDocument>('Settings', SettingsSchema);
