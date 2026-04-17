export type AiProviderType = 'openai' | 'gemini' | 'grok';

export interface AiAccount {
  id: string;
  provider: AiProviderType;
  label: string;
  apiKey: string;
  model: string;
}

export interface ISettings {
  _id?: unknown;
  accounts: AiAccount[];
  primaryAccountId: string;
  fallbackAccountIds: string[];
  updatedAt?: Date;
}
