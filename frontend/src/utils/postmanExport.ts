import { ApiEndpoint, Project } from '../types';

/**
 * Builds a Postman Collection v2.1 JSON document from a project + endpoints.
 *
 * Schema reference: https://schema.getpostman.com/json/collection/v2.1.0/collection.json
 */
export function buildPostmanCollection(project: Project, endpoints: ApiEndpoint[]): PostmanCollection {
  const grouped = groupByBasePath(endpoints);

  const folders: PostmanFolder[] = Object.entries(grouped).map(([basePath, eps]) => ({
    name: `/${basePath}`,
    item: eps.map((ep) => buildRequestItem(ep)),
  }));

  return {
    info: {
      name: project.name || 'API Mocker AI Export',
      description: project.description || `Mock API for ${project.name}`,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: folders,
    variable: [
      {
        key: 'baseUrl',
        value: `${guessOrigin()}/mock`,
        type: 'string',
      },
    ],
  };
}

/**
 * Triggers a browser download of the given collection as a JSON file.
 */
export function downloadCollection(collection: PostmanCollection, filename: string): void {
  const json = JSON.stringify(collection, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function collectionFilename(project: Project): string {
  const base = project.slug || project.name || 'api-mocker-collection';
  const safe = base.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `${safe || 'collection'}.postman_collection.json`;
}

// ---------- internals ----------

function groupByBasePath(endpoints: ApiEndpoint[]): Record<string, ApiEndpoint[]> {
  return endpoints.reduce<Record<string, ApiEndpoint[]>>((acc, ep) => {
    if (!acc[ep.basePath]) acc[ep.basePath] = [];
    acc[ep.basePath]!.push(ep);
    return acc;
  }, {});
}

function guessOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return 'http://localhost:4000';
}

function buildRequestItem(ep: ApiEndpoint): PostmanRequestItem {
  const methodHasBody = ['POST', 'PUT', 'PATCH'].includes(ep.httpMethod);

  const pathSegments = ep.fullPath.split('/').filter(Boolean);
  const urlRaw = `{{baseUrl}}/${ep.fullPath}`;

  const request: PostmanRequest = {
    method: ep.httpMethod,
    header: [{ key: 'Content-Type', value: 'application/json', type: 'text' }],
    url: {
      raw: urlRaw,
      host: ['{{baseUrl}}'],
      path: pathSegments,
    },
    description: ep.description || undefined,
  };

  if (methodHasBody && ep.responseStructure) {
    request.body = {
      mode: 'raw',
      raw: ep.responseStructure,
      options: { raw: { language: 'json' } },
    };
  }

  const responses: PostmanResponse[] = [];
  const exampleBody = ep.generatedData ?? safeParse(ep.responseStructure);
  if (exampleBody !== undefined && exampleBody !== null) {
    responses.push({
      name: ep.name || 'Example',
      originalRequest: request,
      status: statusText(ep.statusCode),
      code: ep.statusCode,
      _postman_previewlanguage: 'json',
      header: [{ key: 'Content-Type', value: 'application/json' }],
      body: JSON.stringify(exampleBody, null, 2),
    });
  }

  return {
    name: ep.name || ep.fullPath,
    request,
    response: responses,
  };
}

function safeParse(value: string): unknown {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function statusText(code: number): string {
  const map: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    204: 'No Content',
    301: 'Moved Permanently',
    302: 'Found',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };
  return map[code] || 'OK';
}

// ---------- Postman v2.1 types (narrow subset) ----------

export interface PostmanCollection {
  info: {
    name: string;
    description?: string;
    schema: string;
  };
  item: PostmanFolder[];
  variable?: Array<{ key: string; value: string; type?: string }>;
}

interface PostmanFolder {
  name: string;
  item: PostmanRequestItem[];
}

interface PostmanRequestItem {
  name: string;
  request: PostmanRequest;
  response: PostmanResponse[];
}

interface PostmanRequest {
  method: string;
  header: Array<{ key: string; value: string; type?: string }>;
  url: {
    raw: string;
    host: string[];
    path: string[];
  };
  body?: {
    mode: 'raw';
    raw: string;
    options?: { raw?: { language: string } };
  };
  description?: string;
}

interface PostmanResponse {
  name: string;
  originalRequest: PostmanRequest;
  status: string;
  code: number;
  _postman_previewlanguage: string;
  header: Array<{ key: string; value: string }>;
  body: string;
}
