export interface ISettings {
  _id?: unknown;
  aiProvider: string;
  openaiApiKey: string;
  geminiApiKey: string;
  grokApiKey: string;
  openaiModel: string;
  geminiModel: string;
  grokModel: string;
  updatedAt?: Date;
}
