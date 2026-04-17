import crypto from 'crypto';
import { ISettings, AiAccount, AiProviderType } from '../../../domain/entities/Settings';
import { ISettingsRepository } from '../../../domain/interfaces/ISettingsRepository';
import { SettingsModel } from '../models/SettingsModel';
import { encrypt, decrypt } from '../../crypto/encryption';

const MASK_MARKER = '****';

type LegacyShape = {
  aiProvider?: string;
  openaiApiKey?: string;
  geminiApiKey?: string;
  grokApiKey?: string;
  openaiModel?: string;
  geminiModel?: string;
  grokModel?: string;
};

const DEFAULT_MODELS: Record<AiProviderType, string> = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-1.5-flash',
  grok: 'grok-2-latest',
};

function isLegacyShape(doc: Record<string, unknown>): boolean {
  return (
    typeof doc.openaiApiKey === 'string' ||
    typeof doc.geminiApiKey === 'string' ||
    typeof doc.grokApiKey === 'string' ||
    typeof doc.aiProvider === 'string'
  );
}

function migrateLegacy(doc: LegacyShape): Pick<ISettings, 'accounts' | 'primaryAccountId' | 'fallbackAccountIds'> {
  const accounts: AiAccount[] = [];
  const providers: AiProviderType[] = ['openai', 'gemini', 'grok'];

  for (const p of providers) {
    const keyField = `${p}ApiKey` as keyof LegacyShape;
    const modelField = `${p}Model` as keyof LegacyShape;
    const apiKey = (doc[keyField] as string) || '';
    if (!apiKey) continue;
    accounts.push({
      id: crypto.randomUUID(),
      provider: p,
      label: `${p.charAt(0).toUpperCase()}${p.slice(1)}`,
      apiKey, // still encrypted — migration keeps ciphertext as-is
      model: (doc[modelField] as string) || DEFAULT_MODELS[p],
    });
  }

  const activeProvider = (doc.aiProvider as AiProviderType | undefined) || 'openai';
  const primary = accounts.find((a) => a.provider === activeProvider) || accounts[0];

  return {
    accounts,
    primaryAccountId: primary?.id || '',
    fallbackAccountIds: [],
  };
}

function decryptAccounts(accounts: AiAccount[]): AiAccount[] {
  return accounts.map((a) => ({ ...a, apiKey: a.apiKey ? decrypt(a.apiKey) : '' }));
}

function encryptAccounts(accounts: AiAccount[]): AiAccount[] {
  return accounts.map((a) => ({ ...a, apiKey: a.apiKey ? encrypt(a.apiKey) : '' }));
}

function normalize(raw: Record<string, unknown>): ISettings {
  const accounts = Array.isArray(raw.accounts) ? (raw.accounts as AiAccount[]) : [];

  let base: Pick<ISettings, 'accounts' | 'primaryAccountId' | 'fallbackAccountIds'>;
  if (accounts.length === 0 && isLegacyShape(raw)) {
    base = migrateLegacy(raw as LegacyShape);
  } else {
    base = {
      accounts,
      primaryAccountId: (raw.primaryAccountId as string) || '',
      fallbackAccountIds: Array.isArray(raw.fallbackAccountIds) ? (raw.fallbackAccountIds as string[]) : [],
    };
  }

  return {
    _id: raw._id,
    accounts: decryptAccounts(base.accounts),
    primaryAccountId: base.primaryAccountId,
    fallbackAccountIds: base.fallbackAccountIds,
    updatedAt: raw.updatedAt as Date | undefined,
  };
}

export class SettingsRepositoryImpl implements ISettingsRepository {
  async get(): Promise<ISettings> {
    let doc = await SettingsModel.findOne().lean();
    if (!doc) {
      await SettingsModel.create({});
      doc = await SettingsModel.findOne().lean();
    }
    const raw = doc as unknown as Record<string, unknown>;
    const settings = normalize(raw);

    // If we auto-migrated from legacy, persist the new shape and clear legacy fields.
    if ((raw.accounts as unknown[] | undefined)?.length !== settings.accounts.length && isLegacyShape(raw)) {
      await SettingsModel.findOneAndUpdate(
        {},
        {
          $set: {
            accounts: encryptAccounts(settings.accounts).map((a) => ({ ...a })),
            primaryAccountId: settings.primaryAccountId,
            fallbackAccountIds: settings.fallbackAccountIds,
          },
          $unset: {
            aiProvider: '',
            openaiApiKey: '',
            geminiApiKey: '',
            grokApiKey: '',
            openaiModel: '',
            geminiModel: '',
            grokModel: '',
          },
        },
      );
    }

    return settings;
  }

  async update(data: Partial<ISettings>): Promise<ISettings> {
    if (data.accounts) {
      const existing = await this.get();
      const existingById = new Map(existing.accounts.map((a) => [a.id, a]));

      const merged = data.accounts.map((incoming) => {
        const prev = existingById.get(incoming.id);
        // If apiKey is masked (contains ****) or empty and prev had a key, keep the previous key.
        let apiKey = incoming.apiKey || '';
        if (apiKey.includes(MASK_MARKER)) {
          apiKey = prev?.apiKey || '';
        }
        return {
          id: incoming.id,
          provider: incoming.provider,
          label: incoming.label || '',
          apiKey,
          model: incoming.model || DEFAULT_MODELS[incoming.provider],
        };
      });

      data = { ...data, accounts: merged };
    }

    const payload: Record<string, unknown> = {};
    if (data.accounts) payload.accounts = encryptAccounts(data.accounts);
    if (data.primaryAccountId !== undefined) payload.primaryAccountId = data.primaryAccountId;
    if (data.fallbackAccountIds !== undefined) payload.fallbackAccountIds = data.fallbackAccountIds;

    const doc = await SettingsModel.findOneAndUpdate({}, { $set: payload }, {
      new: true,
      upsert: true,
    }).lean();
    return normalize(doc as unknown as Record<string, unknown>);
  }
}
