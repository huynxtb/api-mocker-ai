import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { endpointApi, projectApi, settingsApi } from '../services/api';
import { useAlert } from '../context/AlertContext';
import type { ApiEndpoint, PaginationConfig } from '../types';
import { ArrowLeft, Copy, Sparkles, Loader2, ChevronDown, Terminal, Trash2 } from 'lucide-react';
import Button from '../components/common/Button';
import IconButton from '../components/common/IconButton';
import ConfirmDialog from '../components/common/ConfirmDialog';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

/** Status codes that can have a response body */
function statusCodeHasBody(code: number): boolean {
  // 204 No Content, 304 Not Modified have no body
  if (code === 204 || code === 304) return false;
  // 1xx informational have no body
  if (code >= 100 && code < 200) return false;
  return true;
}

const PAGE_KEYS = ['page', 'currentPage', 'current_page', 'pageNumber', 'page_number'];
const LIMIT_KEYS = ['limit', 'per_page', 'perPage', 'pageSize', 'page_size', 'size'];
const TOTAL_KEYS = ['total', 'totalItems', 'total_items', 'totalCount', 'total_count', 'count'];

/** Recursively find the dot-path to the first array in a JSON object */
function findArrayPath(obj: unknown, prefix = ''): string {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return '';
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    const val = (obj as Record<string, unknown>)[key];
    const path = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(val)) return path;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const found = findArrayPath(val, path);
      if (found) return found;
    }
  }
  return '';
}

/** Get a nested value by dot-path */
function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce((o, k) => (o as Record<string, unknown>)?.[k], obj);
}

/** Auto-detect pagination config from JSON structure */
function detectPagination(json: string): { detected: boolean; dataKey: string; pageKey: string; limitKey: string; totalKey: string } | null {
  try {
    const parsed = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null) return null;

    // Find nested array path (e.g. "result.data")
    const dataKey = findArrayPath(parsed);
    let pageKey = 'page';
    let limitKey = 'limit';
    let totalKey = 'total';
    let detected = false;

    // Look for pagination metadata as siblings of the data array
    const parentPath = dataKey.includes('.') ? dataKey.substring(0, dataKey.lastIndexOf('.')) : '';
    const searchObj = parentPath ? getByPath(parsed, parentPath) : parsed;

    if (searchObj && typeof searchObj === 'object' && !Array.isArray(searchObj)) {
      const objKeys = Object.keys(searchObj as Record<string, unknown>);
      const foundPage = objKeys.find((k) => PAGE_KEYS.includes(k));
      const foundLimit = objKeys.find((k) => LIMIT_KEYS.includes(k));
      const foundTotal = objKeys.find((k) => TOTAL_KEYS.includes(k));
      if (foundPage || foundLimit || foundTotal) {
        detected = true;
        if (foundPage) pageKey = foundPage;
        if (foundLimit) limitKey = foundLimit;
        if (foundTotal) totalKey = foundTotal;
      }
    }

    // Also scan root-level objects for pagination metadata (original behavior)
    if (!detected) {
      for (const key of Object.keys(parsed)) {
        const val = parsed[key];
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          const objKeys = Object.keys(val);
          const foundPage = objKeys.find((k) => PAGE_KEYS.includes(k));
          const foundLimit = objKeys.find((k) => LIMIT_KEYS.includes(k));
          const foundTotal = objKeys.find((k) => TOTAL_KEYS.includes(k));
          if (foundPage || foundLimit || foundTotal) {
            detected = true;
            if (foundPage) pageKey = foundPage;
            if (foundLimit) limitKey = foundLimit;
            if (foundTotal) totalKey = foundTotal;
            break;
          }
        }
      }
    }

    if (dataKey || detected) return { detected: true, dataKey, pageKey, limitKey, totalKey };
  } catch { /* ignore */ }
  return null;
}

/** Try to beautify JSON string */
function beautifyJson(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-emerald-400',
  POST: 'text-blue-400',
  PUT: 'text-amber-400',
  PATCH: 'text-orange-400',
  DELETE: 'text-red-400',
};

export default function EndpointDetailPage() {
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const { projectId, endpointId } = useParams();
  const navigate = useNavigate();
  const [endpoint, setEndpoint] = useState<ApiEndpoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [httpMethod, setHttpMethod] = useState('GET');
  const [statusCode, setStatusCode] = useState(200);
  const [responseStructure, setResponseStructure] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [itemCount, setItemCount] = useState(15);
  const [isList, setIsList] = useState(false);
  const [idField, setIdField] = useState('');
  const [pagDataPath, setPagDataPath] = useState('');
  const [pagPageKey, setPagPageKey] = useState('page');
  const [pagLimitKey, setPagLimitKey] = useState('limit');
  const [pagDefaultLimit, setPagDefaultLimit] = useState(10);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Skip auto-detect on the initial load so stored isList/paginationConfig aren't overwritten.
  const initialLoadDone = useRef(false);

  const loadData = useCallback(async () => {
    try {
      const [, epRes] = await Promise.all([
        projectApi.get(projectId!),
        endpointApi.get(projectId!, endpointId!),
      ]);
      const ep = epRes.data.data;
      setEndpoint(ep);
      setName(ep.name);
      setDescription(ep.description);
      setCustomEndpoint(ep.customEndpoint);
      setHttpMethod(ep.httpMethod);
      setStatusCode(ep.statusCode);
      setResponseStructure(ep.responseStructure ? beautifyJson(ep.responseStructure) : '');
      setAiPrompt(ep.aiPrompt);
      setItemCount(ep.itemCount);
      setIsList(ep.isList ?? false);
      setIdField(ep.idField ?? '');
      if (ep.paginationConfig) {
        setPagDataPath(ep.paginationConfig.dataKey || '');
        setPagPageKey(ep.paginationConfig.pageKey || 'page');
        setPagLimitKey(ep.paginationConfig.limitKey || 'limit');
        setPagDefaultLimit(ep.paginationConfig.defaultLimit || 10);
      }
    } catch {
      showAlert('error', t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [projectId, endpointId, t]);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-detect paging only when the user edits the response structure (not on initial load)
  useEffect(() => {
    if (!initialLoadDone.current) {
      if (!loading) initialLoadDone.current = true;
      return;
    }
    if (responseStructure.trim()) {
      const result = detectPagination(responseStructure);
      if (result?.detected && !isList) {
        setIsList(true);
        setPagDataPath(result.dataKey);
        setPagPageKey(result.pageKey);
        setPagLimitKey(result.limitKey);
      }
    }
  }, [responseStructure, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t('common.required');
    if (!httpMethod) errs.httpMethod = t('common.required');
    if (!statusCode || statusCode < 100 || statusCode > 599) errs.statusCode = 'Invalid status code';

    // GET with body-capable status requires response structure; other methods validate JSON if provided
    if (statusCodeHasBody(statusCode) && responseStructure.trim()) {
      try {
        JSON.parse(responseStructure);
      } catch {
        errs.responseStructure = 'Invalid JSON';
      }
    } else if (httpMethod === 'GET' && statusCodeHasBody(statusCode) && !responseStructure.trim()) {
      errs.responseStructure = t('common.required');
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  /** Single button: save + generate (if response structure present) */
  async function handleSaveAndGenerate() {
    if (!validate()) return;

    // Check AI config before generating when response structure provided
    if (statusCodeHasBody(statusCode) && responseStructure.trim()) {
      try {
        const settingsRes = await settingsApi.get();
        if (!settingsRes.data.data?.ready) {
          showAlert('error', t('endpoint.configRequired'));
          navigate('/settings');
          return;
        }
      } catch {
        showAlert('error', t('endpoint.configRequired'));
        navigate('/settings');
        return;
      }
    }

    setSubmitting(true);
    try {
      let paginationConfig: PaginationConfig | null = null;
      if (isList) {
        const detected = detectPagination(responseStructure);
        paginationConfig = {
          enabled: true,
          dataKey: pagDataPath || detected?.dataKey || '',
          pageKey: pagPageKey,
          limitKey: pagLimitKey,
          totalKey: detected?.totalKey || 'total',
          defaultLimit: pagDefaultLimit,
        };
      }

      const payload = {
        name,
        description,
        customEndpoint,
        httpMethod,
        statusCode,
        responseStructure,
        aiPrompt,
        itemCount: isList ? itemCount : 1,
        isList,
        idField,
        paginationConfig,
      };

      const res = await endpointApi.generate(projectId!, endpointId!, payload);
      setEndpoint(res.data.data);
      showAlert('success',
        responseStructure.trim()
          ? t('endpoint.generateSuccess')
          : t('endpoint.updateSuccess'),
      );
    } catch {
      showAlert('error', t('common.error'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await endpointApi.delete(projectId!, endpointId!);
      showAlert('success', t('endpoint.deleteSuccess'));
      navigate(`/projects/${projectId}/endpoints`);
    } catch {
      showAlert('error', t('common.error'));
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  function copyUrl() {
    const url = `${window.location.origin}/mock/${previewPath}`;
    navigator.clipboard.writeText(url);
    showAlert('success', t('endpoint.copyUrl'));
  }

  // Compute live preview path from endpoint basePath + current customEndpoint
  const previewPath = endpoint
    ? (() => {
        const suffix = endpoint.customEndpoint ? '/' + endpoint.customEndpoint : '';
        const baseFullPath = endpoint.fullPath.endsWith(suffix) && suffix
          ? endpoint.fullPath.slice(0, -suffix.length)
          : endpoint.fullPath;
        return baseFullPath + (customEndpoint ? '/' + customEndpoint : '');
      })()
    : '';

  /** Auto-beautify on blur */
  function handleResponseBlur() {
    if (responseStructure.trim()) {
      setResponseStructure(beautifyJson(responseStructure));
    }
  }

  /** Auto-beautify on paste */
  function handleResponsePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    setResponseStructure(beautifyJson(pasted));
  }

  if (loading || !endpoint) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Loading endpoint…</p>
      </div>
    );
  }

  const inputBase =
    'w-full px-3 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-shadow text-sm';
  const inputBorder = (field: string) =>
    errors[field]
      ? 'border-red-400 dark:border-red-500 focus:ring-red-500/40'
      : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500/40';

  const sectionLabel = 'text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500 mb-3';

  return (
    <div className="max-w-4xl mx-auto px-1 pb-16">
      <Button
        variant="ghost"
        size="sm"
        icon={<ArrowLeft size={15} />}
        onClick={() => navigate(`/projects/${projectId}/endpoints`)}
        className="mb-5 !px-2"
      >
        {t('common.back')}
      </Button>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {t('endpoint.editTitle')}
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{endpoint.name}</p>
        </div>
        <Button
          variant="danger"
          size="sm"
          icon={<Trash2 size={14} />}
          loading={deleting}
          onClick={() => setDeleteOpen(true)}
        >
          {t('common.delete')}
        </Button>
      </div>

      {/* Full path preview — terminal style */}
      <div className="flex items-center gap-0 mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shrink-0">
          <Terminal size={13} className="text-gray-400 dark:text-gray-500" />
          <span className={`text-xs font-bold font-mono ${METHOD_COLORS[httpMethod] ?? 'text-gray-300'}`}>
            {httpMethod}
          </span>
        </div>
        <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-900/70 px-3.5 py-2.5 min-w-0">
          <span className="font-mono text-sm text-gray-500 dark:text-gray-400 truncate">
            {window.location.origin}
            <span className="text-gray-700 dark:text-gray-200">/mock/{previewPath}</span>
          </span>
        </div>
        <div className="border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/70 shrink-0">
          <IconButton
            tone="primary"
            size="md"
            aria-label={t('endpoint.copyUrl')}
            icon={<Copy size={13} />}
            onClick={copyUrl}
            className="!rounded-none"
          />
        </div>
      </div>

      {/* Main form card */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm divide-y divide-gray-100 dark:divide-gray-700/60">

        {/* Section: Endpoint Config */}
        <div className="px-6 py-5">
          <p className={sectionLabel}>Endpoint Config</p>
          <div className="space-y-4">
            {/* Name & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('endpoint.name')} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
                  className={`${inputBase} ${inputBorder('name')}`}
                />
                {errors.name && (
                  <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('endpoint.description')}
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('endpoint.descriptionPlaceholder')}
                  className={`${inputBase} border-gray-200 dark:border-gray-700 focus:ring-indigo-500/40`}
                />
              </div>
            </div>

            {/* Method, Status, Custom Endpoint */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('endpoint.httpMethod')} <span className="text-red-400">*</span>
                </label>
                <select
                  value={httpMethod}
                  onChange={(e) => setHttpMethod(e.target.value)}
                  className={`${inputBase} ${inputBorder('httpMethod')} font-medium`}
                >
                  {HTTP_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('endpoint.statusCode')} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={statusCode}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '');
                    setStatusCode(v ? Number(v) : 0);
                    setErrors((p) => ({ ...p, statusCode: '' }));
                  }}
                  className={`${inputBase} ${inputBorder('statusCode')} font-mono`}
                />
                {errors.statusCode && (
                  <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                    {errors.statusCode}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('endpoint.customEndpoint')}
                </label>
                <input
                  type="text"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value.replace(/^\/+/, ''))}
                  placeholder="e.g. list, :id, approve"
                  className={`${inputBase} border-gray-200 dark:border-gray-700 focus:ring-indigo-500/40 font-mono`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Response */}
        {statusCodeHasBody(statusCode) && (
          <div className="px-6 py-5">
            <p className={sectionLabel}>Response</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('endpoint.responseStructure')}
                  {httpMethod === 'GET' && <span className="text-red-400 ml-0.5">*</span>}
                  <span className="ml-1.5 text-gray-400 dark:text-gray-500 font-normal normal-case tracking-normal">
                    — JSON structure
                  </span>
                </label>
                <div className={`rounded-xl overflow-hidden border transition-shadow ${
                  errors.responseStructure
                    ? 'border-red-400 dark:border-red-500 ring-2 ring-red-500/20'
                    : 'border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-400 dark:focus-within:border-indigo-500'
                }`}>
                  {/* Editor header bar */}
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                    <span className="ml-2 text-[10px] font-mono text-gray-400 dark:text-gray-500">response.json</span>
                  </div>
                  <textarea
                    value={responseStructure}
                    onChange={(e) => {
                      setResponseStructure(e.target.value);
                      setErrors((p) => ({ ...p, responseStructure: '' }));
                    }}
                    onBlur={handleResponseBlur}
                    onPaste={handleResponsePaste}
                    placeholder={t('endpoint.responseStructurePlaceholder')}
                    rows={16}
                    spellCheck={false}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-mono text-sm leading-relaxed resize-y focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
                  />
                </div>
                {errors.responseStructure && (
                  <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                    {errors.responseStructure}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section: Pagination */}
        {statusCodeHasBody(statusCode) && (
          <div className="px-6 py-5">
            <p className={sectionLabel}>Pagination</p>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 overflow-hidden">
              {/* Toggle row */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('endpoint.isList')}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Enable to generate a list of items with optional pagination support
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isList}
                  onClick={() => setIsList((v) => !v)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${
                    isList ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                      isList ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Expanded sub-fields */}
              {isList && (
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      {t('endpoint.itemCount')}
                      <span className="ml-1.5 font-normal text-gray-400 dark:text-gray-500">
                        ({t('endpoint.itemCountHint')})
                      </span>
                    </label>
                    <input
                      type="number"
                      value={itemCount}
                      onChange={(e) => setItemCount(Math.min(50, Math.max(1, Number(e.target.value))))}
                      min={1}
                      max={50}
                      className={`${inputBase} border-gray-200 dark:border-gray-700 focus:ring-indigo-500/40 max-w-[140px] font-mono`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      {t('endpoint.pagDataPath')}
                    </label>
                    <input
                      type="text"
                      value={pagDataPath}
                      onChange={(e) => setPagDataPath(e.target.value)}
                      placeholder="e.g. result.data, data, items"
                      className={`${inputBase} border-gray-200 dark:border-gray-700 focus:ring-indigo-500/40 font-mono max-w-xs`}
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500 mb-2.5">
                      Paging Params
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                          {t('endpoint.pagPageKey')}
                        </label>
                        <input
                          type="text"
                          value={pagPageKey}
                          onChange={(e) => setPagPageKey(e.target.value)}
                          placeholder="page"
                          className={`${inputBase} border-gray-200 dark:border-gray-700 focus:ring-indigo-500/40 font-mono`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                          {t('endpoint.pagLimitKey')}
                        </label>
                        <input
                          type="text"
                          value={pagLimitKey}
                          onChange={(e) => setPagLimitKey(e.target.value)}
                          placeholder="limit"
                          className={`${inputBase} border-gray-200 dark:border-gray-700 focus:ring-indigo-500/40 font-mono`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                          {t('endpoint.pagDefaultLimit')}
                        </label>
                        <input
                          type="number"
                          value={pagDefaultLimit}
                          onChange={(e) => setPagDefaultLimit(Math.max(1, Number(e.target.value)))}
                          min={1}
                          className={`${inputBase} border-gray-200 dark:border-gray-700 focus:ring-indigo-500/40 font-mono`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section: Advanced Options */}
        {statusCodeHasBody(statusCode) && (
          <div className="px-6 py-5">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer select-none list-none">
                <p className={sectionLabel + ' mb-0'}>Advanced Options</p>
                <ChevronDown
                  size={15}
                  className="text-gray-400 dark:text-gray-500 transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    {t('endpoint.aiPrompt')}
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={t('endpoint.aiPromptPlaceholder')}
                    rows={3}
                    className={`${inputBase} border-gray-200 dark:border-gray-700 focus:ring-indigo-500/40 resize-none leading-relaxed`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    {t('endpoint.idField')}
                  </label>
                  <input
                    type="text"
                    value={idField}
                    onChange={(e) => setIdField(e.target.value)}
                    placeholder={t('endpoint.idFieldPlaceholder')}
                    className={`${inputBase} border-gray-200 dark:border-gray-700 focus:ring-indigo-500/40 font-mono max-w-xs`}
                  />
                </div>
              </div>
            </details>
          </div>
        )}

        {/* Action footer */}
        <div className="px-6 py-4 bg-gray-50/70 dark:bg-gray-900/30 flex items-center gap-3 rounded-b-2xl">
          <Button
            variant="primary"
            icon={<Sparkles size={15} />}
            loading={submitting}
            onClick={handleSaveAndGenerate}
          >
            {submitting ? t('endpoint.generating') : t('endpoint.saveAndGenerate')}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        message={t('endpoint.deleteConfirm')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      {/* Generated Data Preview */}
      {endpoint.generatedData != null && (
        <div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {t('endpoint.generatedData')}
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              JSON
            </span>
          </div>
          {/* Editor-style preview */}
          <div className="relative">
            <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 border-b border-gray-700/60">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
              <span className="ml-2 text-[10px] font-mono text-gray-500">generated_data.json</span>
            </div>
            <pre className="bg-gray-900 text-green-400 px-5 py-4 overflow-auto max-h-[500px] text-sm font-mono leading-relaxed whitespace-pre">
              {JSON.stringify(endpoint.generatedData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
