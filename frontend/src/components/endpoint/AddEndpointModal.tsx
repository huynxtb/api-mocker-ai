import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, FilePlus2, Eye, Plus, Pencil, Trash2, Wrench } from 'lucide-react';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import { endpointApi } from '../../services/api';
import { useAlert } from '../../context/AlertContext';

const METHOD_ICONS: Record<string, typeof Eye> = {
  GET: Eye,
  POST: Plus,
  PUT: Pencil,
  DELETE: Trash2,
  PATCH: Wrench,
};

interface Props {
  projectId: string;
  basePaths: string[];
  onClose: () => void;
  onAdded: () => void;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

const METHOD_COLORS: Record<string, string> = {
  GET:    'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700/50',
  POST:   'text-blue-600   dark:text-blue-400   bg-blue-50   dark:bg-blue-900/30   border-blue-200   dark:border-blue-700/50',
  PUT:    'text-amber-600  dark:text-amber-400  bg-amber-50  dark:bg-amber-900/30  border-amber-200  dark:border-amber-700/50',
  DELETE: 'text-red-600    dark:text-red-400    bg-red-50    dark:bg-red-900/30    border-red-200    dark:border-red-700/50',
  PATCH:  'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 border-violet-200 dark:border-violet-700/50',
};

export default function AddEndpointModal({ projectId, basePaths, onClose, onAdded }: Props) {
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePath, setBasePath] = useState(basePaths[0] || '');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [httpMethod, setHttpMethod] = useState('POST');
  const [statusCode, setStatusCode] = useState(200);
  const [loading, setLoading] = useState(false);

  async function handleAddSingle(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !basePath.trim()) return;
    setLoading(true);
    try {
      await endpointApi.add(projectId, {
        name,
        description,
        basePath,
        customEndpoint,
        httpMethod,
        statusCode,
      });
      showAlert('success', t('endpoint.createSuccess'));
      onAdded();
    } catch {
      showAlert('error', t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl dark:shadow-black/60 border border-gray-200 dark:border-gray-700/60 animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700/60">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('endpoint.addEndpoint')}</h2>
          <IconButton
            tone="neutral"
            aria-label={t('common.cancel')}
            icon={<X size={17} />}
            onClick={onClose}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleAddSingle} className="px-6 py-5 space-y-5">

          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              {t('endpoint.name')}
              <span className="ml-1 text-indigo-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('endpoint.addNamePlaceholder')}
              required
              className="w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              {t('endpoint.description')}
              <span className="ml-1.5 text-xs font-normal text-gray-400 dark:text-gray-500">{t('common.optional', 'Optional')}</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Base endpoint */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              {t('endpoint.baseEndpoint')}
              <span className="ml-1 text-indigo-500">*</span>
            </label>
            <select
              value={basePath}
              onChange={(e) => setBasePath(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors"
            >
              {basePaths.map((bp) => (
                <option key={bp} value={bp}>{bp}</option>
              ))}
            </select>
          </div>

          {/* Custom endpoint */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              {t('endpoint.customEndpoint')}
              <span className="ml-1.5 text-xs font-normal text-gray-400 dark:text-gray-500">{t('common.optional', 'Optional')}</span>
            </label>
            <input
              type="text"
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value.replace(/^\/+/, ''))}
              placeholder={t('endpoint.addCustomEndpointPlaceholder')}
              className="w-full px-3.5 py-2.5 rounded-lg font-mono text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {/* HTTP Method + Status Code */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('endpoint.httpMethod')}</label>
              <div className="flex flex-wrap gap-1.5">
                {HTTP_METHODS.map((m) => {
                  const Icon = METHOD_ICONS[m]!;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setHttpMethod(m)}
                      className={[
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border transition-all',
                        httpMethod === m
                          ? METHOD_COLORS[m]
                          : 'text-gray-500 dark:text-gray-400 bg-transparent border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                      ].join(' ')}
                    >
                      <Icon size={11} />
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('endpoint.statusCode')}</label>
              <input
                type="number"
                value={statusCode}
                onChange={(e) => setStatusCode(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1 border-t border-gray-100 dark:border-gray-700/60 mt-2">
            <Button type="submit" variant="primary" icon={<FilePlus2 size={15} />} loading={loading}>
              {loading ? t('common.loading') : t('common.create')}
            </Button>
            <Button type="button" variant="secondary" icon={<X size={15} />} onClick={onClose}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
