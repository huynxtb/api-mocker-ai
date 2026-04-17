import { Router, Request, Response } from 'express';
import { ApiEndpointModel } from '../../infrastructure/database/models/ApiEndpointModel';
import { ProjectModel } from '../../infrastructure/database/models/ProjectModel';

export const mockApiRouter = Router();

// Catch-all handler for mock API requests
mockApiRouter.all('/*', async (req: Request, res: Response) => {
  try {
    // Remove leading slash and 'mock/' prefix is already stripped by Express mount
    const requestPath = (req.params as Record<string, string>)[0] || '';
    const method = req.method;

    // Try exact match first
    let endpoint = await ApiEndpointModel.findOne({
      fullPath: requestPath,
      httpMethod: method,
    }).lean();

    // If no exact match, try matching parameterized routes (e.g., :id)
    if (!endpoint) {
      endpoint = await findParameterizedEndpoint(requestPath, method);
    }

    if (!endpoint) {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: requestPath,
        method,
      });
      return;
    }

    // No generated data
    if (!endpoint.generatedData) {
      res.status(endpoint.statusCode).json({
        success: true,
        message: 'Endpoint configured but no data generated yet. Use the admin UI to generate data.',
      });
      return;
    }

    const data = endpoint.generatedData;

    // Handle pagination for list endpoints
    if (endpoint.paginationConfig?.enabled && data) {
      const configPageKey = endpoint.paginationConfig.pageKey || '';
      const configLimitKey = endpoint.paginationConfig.limitKey || '';
      const PAGE_PARAMS = [...new Set([configPageKey, 'page', 'currentPage', 'current_page', 'pageNumber', 'page_number'].filter(Boolean))];
      const LIMIT_PARAMS = [...new Set([configLimitKey, 'limit', 'per_page', 'perPage', 'pageSize', 'page_size', 'size'].filter(Boolean))];
      const defaultLimit = endpoint.paginationConfig.defaultLimit || 10;

      // Support custom + common page/limit query param names (custom checked first)
      const page = PAGE_PARAMS.reduce((v, k) => v || parseInt(req.query[k] as string) || 0, 0) || 1;
      const limit = LIMIT_PARAMS.reduce((v, k) => v || parseInt(req.query[k] as string) || 0, 0) || defaultLimit;

      // Plain array data: paginate and return array directly
      if (Array.isArray(data)) {
        const total = data.length;
        const start = (page - 1) * limit;
        const paginatedItems = data.slice(start, start + limit);
        res.status(endpoint.statusCode).json(paginatedItems);
        return;
      }

      // Object data: support nested dot-paths (e.g. "result.data")
      const objData = data as Record<string, unknown>;
      const TOTAL_PARAMS = ['total', 'totalItems', 'total_items', 'totalCount', 'total_count', 'count', 'totalPages', 'total_pages'];
      const dataPath = endpoint.paginationConfig.dataKey || findNestedArrayPath(objData) || 'data';

      const items = (getByPath(objData, dataPath) as unknown[]) || [];
      const total = items.length;
      const start = (page - 1) * limit;
      const paginatedItems = items.slice(start, start + limit);

      // Deep clone response and set paginated items at the data path
      const response = JSON.parse(JSON.stringify(objData));
      setByPath(response, dataPath, paginatedItems);

      // Find pagination metadata as siblings of the data array
      const parentPath = dataPath.includes('.') ? dataPath.substring(0, dataPath.lastIndexOf('.')) : '';
      const metaObj = parentPath ? getByPath(response, parentPath) as Record<string, unknown> : response;

      if (metaObj && typeof metaObj === 'object' && !Array.isArray(metaObj)) {
        const objKeys = Object.keys(metaObj);
        const foundPage = objKeys.find(k => PAGE_PARAMS.includes(k));
        const foundLimit = objKeys.find(k => LIMIT_PARAMS.includes(k));
        const foundTotal = objKeys.find(k => TOTAL_PARAMS.includes(k));
        if (foundPage) metaObj[foundPage] = page;
        if (foundLimit) metaObj[foundLimit] = limit;
        if (foundTotal) metaObj[foundTotal] = total;
      }

      res.status(endpoint.statusCode).json(response);
      return;
    }

    // Default: return generated data as-is
    res.status(endpoint.statusCode).json(data);
  } catch (err) {
    console.error('Mock API error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

async function findParameterizedEndpoint(requestPath: string, method: string) {
  // Get all endpoints for this method
  const endpoints = await ApiEndpointModel.find({ httpMethod: method }).lean();

  for (const ep of endpoints) {
    if (matchPath(requestPath, ep.fullPath)) {
      return ep;
    }
  }
  return null;
}

function matchPath(requestPath: string, templatePath: string): boolean {
  const reqParts = requestPath.split('/');
  const tmplParts = templatePath.split('/');

  if (reqParts.length !== tmplParts.length) return false;

  return tmplParts.every((part, i) => {
    if (part.startsWith(':')) return true;
    return part === reqParts[i];
  });
}

function extractIdFromPath(requestPath: string, templatePath: string): string | null {
  const reqParts = requestPath.split('/');
  const tmplParts = templatePath.split('/');

  for (let i = 0; i < tmplParts.length; i++) {
    if (tmplParts[i] === ':id') {
      return reqParts[i] || null;
    }
  }
  return null;
}

function findArrayKey(data: Record<string, unknown>): string | null {
  for (const key of Object.keys(data)) {
    if (Array.isArray(data[key])) return key;
  }
  return null;
}

/** Recursively find dot-path to first array in nested object */
function findNestedArrayPath(obj: unknown, prefix = ''): string {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return '';
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    const val = (obj as Record<string, unknown>)[key];
    const path = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(val)) return path;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const found = findNestedArrayPath(val, path);
      if (found) return found;
    }
  }
  return '';
}

function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce((o, k) => (o as Record<string, unknown>)?.[k], obj);
}

function setByPath(obj: unknown, path: string, value: unknown): void {
  const keys = path.split('.');
  const last = keys.pop()!;
  const target = keys.reduce((o, k) => (o as Record<string, unknown>)[k], obj) as Record<string, unknown>;
  target[last] = value;
}
