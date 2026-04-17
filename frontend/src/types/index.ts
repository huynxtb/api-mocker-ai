export interface Project {
  _id: string;
  name: string;
  slug: string;
  description: string;
  apiPrefix: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiEndpoint {
  _id: string;
  projectId: string;
  name: string;
  description: string;
  basePath: string;
  customEndpoint: string;
  fullPath: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  statusCode: number;
  responseStructure: string;
  generatedData: unknown;
  aiPrompt: string;
  itemCount: number;
  isList: boolean;
  idField: string;
  paginationConfig: PaginationConfig | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationConfig {
  enabled: boolean;
  pageKey: string;
  limitKey: string;
  totalKey: string;
  dataKey: string;
  defaultLimit: number;
}

export interface AuthUser {
  id: string;
  username: string;
}

export interface Settings {
  aiProvider: string;
  openaiApiKey: string;
  geminiApiKey: string;
  grokApiKey: string;
  openaiModel: string;
  geminiModel: string;
  grokModel: string;
}
