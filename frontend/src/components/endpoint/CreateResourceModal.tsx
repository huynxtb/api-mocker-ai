import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { endpointApi } from '../../services/api';
import { useAlert } from '../../context/AlertContext';
import { X, Plus } from 'lucide-react';
import Button from '../common/Button';
import IconButton from '../common/IconButton';

interface Props {
  projectId: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateResourceModal({ projectId, onClose, onCreated }: Props) {
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [baseEndpoint, setBaseEndpoint] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (!isCustom) {
      setBaseEndpoint(
        name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
      );
    }
  }, [name, isCustom]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(t('common.required'));
      return;
    }
    setLoading(true);
    try {
      await endpointApi.create(projectId, { name, description, baseEndpoint, isCustomEndpoint: isCustom });
      showAlert('success', t('endpoint.createSuccess'));
      onCreated();
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
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('endpoint.createTitle')}</h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{t('endpoint.defaultEndpoints')}</p>
          </div>
          <IconButton
            tone="neutral"
            aria-label={t('common.cancel')}
            icon={<X size={17} />}
            onClick={onClose}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              {t('endpoint.name')}
              <span className="ml-1 text-indigo-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              placeholder={t('endpoint.namePlaceholder')}
              className={[
                'w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 dark:text-gray-100',
                'bg-gray-50 dark:bg-gray-800',
                'border outline-none transition-colors',
                'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                nameError
                  ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20',
              ].join(' ')}
            />
            {nameError && <p className="text-xs text-red-500 dark:text-red-400">{nameError}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              {t('endpoint.description')}
              <span className="ml-1.5 text-xs font-normal text-gray-400 dark:text-gray-500">{t('common.optional', 'Optional')}</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('endpoint.descriptionPlaceholder')}
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none"
            />
          </div>

          {/* Base endpoint */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {t('endpoint.baseEndpoint')}
                <span className="ml-1 text-indigo-500">*</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                <span
                  className={[
                    'relative inline-flex h-4 w-7 shrink-0 rounded-full transition-colors duration-200',
                    isCustom ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'pointer-events-none absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform duration-200',
                      isCustom ? 'translate-x-3' : 'translate-x-0',
                    ].join(' ')}
                  />
                  <input
                    type="checkbox"
                    checked={isCustom}
                    onChange={(e) => setIsCustom(e.target.checked)}
                    className="sr-only"
                  />
                </span>
                {t('endpoint.customEndpointToggle')}
              </label>
            </div>
            <input
              type="text"
              value={baseEndpoint}
              onChange={(e) => setBaseEndpoint(e.target.value.replace(/^\/+/, ''))}
              disabled={!isCustom}
              className={[
                'w-full px-3.5 py-2.5 rounded-lg font-mono text-sm text-gray-900 dark:text-gray-100',
                'border outline-none transition-colors',
                isCustom
                  ? 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20'
                  : 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed',
              ].join(' ')}
            />
          </div>

          <div className="flex items-center gap-3 pt-1 border-t border-gray-100 dark:border-gray-700/60 mt-2">
            <Button type="submit" variant="primary" icon={<Plus size={15} />} loading={loading}>
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
