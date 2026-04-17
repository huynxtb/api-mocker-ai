import { ISettings } from '../../../domain/entities/Settings';
import { ISettingsRepository } from '../../../domain/interfaces/ISettingsRepository';
import { SettingsModel } from '../models/SettingsModel';
import { encrypt, decrypt } from '../../crypto/encryption';

const KEY_FIELDS: (keyof ISettings)[] = ['openaiApiKey', 'geminiApiKey', 'grokApiKey'];

function decryptKeys(settings: ISettings): ISettings {
  const result = { ...settings };
  for (const field of KEY_FIELDS) {
    const val = result[field];
    if (typeof val === 'string' && val) {
      (result as Record<string, unknown>)[field] = decrypt(val);
    }
  }
  return result;
}

function encryptKeys(data: Partial<ISettings>): Partial<ISettings> {
  const result = { ...data };
  for (const field of KEY_FIELDS) {
    const val = result[field];
    if (typeof val === 'string' && val) {
      (result as Record<string, unknown>)[field] = encrypt(val);
    }
  }
  return result;
}

export class SettingsRepositoryImpl implements ISettingsRepository {
  async get(): Promise<ISettings> {
    const settings = await SettingsModel.findOne().lean();
    if (!settings) {
      const doc = await SettingsModel.create({});
      return doc.toObject() as unknown as ISettings;
    }
    return decryptKeys(settings as unknown as ISettings);
  }

  async update(data: Partial<ISettings>): Promise<ISettings> {
    const encrypted = encryptKeys(data);
    const settings = await SettingsModel.findOneAndUpdate({}, encrypted, {
      new: true,
      upsert: true,
    }).lean();
    return decryptKeys(settings as unknown as ISettings);
  }
}
