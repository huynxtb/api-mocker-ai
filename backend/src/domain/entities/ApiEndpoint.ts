export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface PaginationConfig {
  enabled: boolean;
  pageKey: string;
  limitKey: string;
  totalKey: string;
  dataKey: string;
  defaultLimit: number;
}

export interface IApiEndpoint {
  _id?: unknown;
  projectId: string;
  name: string;
  description: string;
  basePath: string;
  customEndpoint: string;
  fullPath: string;
  httpMethod: HttpMethod;
  statusCode: number;
  responseStructure: string;
  generatedData: unknown;
  aiPrompt: string;
  itemCount: number;
  isList: boolean;
  idField: string;
  paginationConfig: PaginationConfig | null;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const DEFAULT_ENDPOINTS: Array<{
  suffix: string;
  method: HttpMethod;
  name: string;
  isDefault: boolean;
}> = [
  { suffix: '', method: 'GET', name: 'List', isDefault: true },
  { suffix: ':id', method: 'GET', name: 'Detail', isDefault: true },
  { suffix: '', method: 'POST', name: 'Create', isDefault: true },
  { suffix: ':id', method: 'PUT', name: 'Update', isDefault: true },
  { suffix: ':id', method: 'DELETE', name: 'Delete', isDefault: true },
];
