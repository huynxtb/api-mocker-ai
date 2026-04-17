import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Download, Layers, CheckSquare, Square } from 'lucide-react';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import { useAlert } from '../../context/AlertContext';
import { ApiEndpoint, Project } from '../../types';
import {
  buildPostmanCollection,
  collectionFilename,
  downloadCollection,
} from '../../utils/postmanExport';

type Mode = 'all' | 'selected';

interface Props {
  project: Project;
  endpoints: ApiEndpoint[];
  onClose: () => void;
}

export default function ExportCollectionModal({ project, endpoints, onClose }: Props) {
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const [mode, setMode] = useState<Mode>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const resources = useMemo(() => {
    const grouped: Record<string, ApiEndpoint[]> = {};
    for (const ep of endpoints) {
      if (!grouped[ep.basePath]) grouped[ep.basePath] = [];
      grouped[ep.basePath]!.push(ep);
    }
    return Object.entries(grouped).map(([basePath, eps]) => ({ basePath, count: eps.length }));
  }, [endpoints]);

  const allSelected = selected.size === resources.length && resources.length > 0;

  function toggleResource(basePath: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(basePath)) next.delete(basePath);
      else next.add(basePath);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(resources.map((r) => r.basePath)));
    }
  }

  const canExport =
    mode === 'all' ? endpoints.length > 0 : selected.size > 0;

  function handleExport() {
    const filtered =
      mode === 'all'
        ? endpoints
        : endpoints.filter((ep) => selected.has(ep.basePath));

    if (filtered.length === 0) return;

    const collection = buildPostmanCollection(project, filtered);
    downloadCollection(collection, collectionFilename(project));
    showAlert('success', t('endpoint.exportSuccess'));
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl dark:shadow-black/60 border border-gray-200 dark:border-gray-700/60 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700/60">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {t('endpoint.exportTitle')}
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {t('endpoint.exportSubtitle')}
            </p>
          </div>
          <IconButton
            tone="neutral"
            aria-label={t('common.cancel')}
            icon={<X size={17} />}
            onClick={onClose}
          />
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          {/* Mode options */}
          <div className="space-y-2">
            <ModeOption
              active={mode === 'all'}
              onClick={() => setMode('all')}
              title={t('endpoint.exportAll')}
              description={t('endpoint.exportAllDesc', { count: endpoints.length })}
            />
            <ModeOption
              active={mode === 'selected'}
              onClick={() => setMode('selected')}
              title={t('endpoint.exportSelected')}
              description={t('endpoint.exportSelectedDesc')}
            />
          </div>

          {/* Resource picker */}
          {mode === 'selected' && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 overflow-hidden">
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t('endpoint.resourcesCount', { count: resources.length })}
                </span>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  {allSelected ? t('endpoint.deselectAll') : t('endpoint.selectAll')}
                </button>
              </div>

              {resources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Layers size={20} className="text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('common.noData')}
                  </p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/60">
                  {resources.map((r) => {
                    const isChecked = selected.has(r.basePath);
                    return (
                      <button
                        key={r.basePath}
                        type="button"
                        onClick={() => toggleResource(r.basePath)}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-white dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <span className={isChecked ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-300 dark:text-gray-600'}>
                          {isChecked ? <CheckSquare size={15} /> : <Square size={15} />}
                        </span>
                        <span className="flex-1 min-w-0 font-mono text-sm text-gray-800 dark:text-gray-200 truncate">
                          /{r.basePath}
                        </span>
                        <span className="shrink-0 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[10px] font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {r.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700/60">
          <Button
            type="button"
            variant="success"
            icon={<Download size={15} />}
            onClick={handleExport}
            disabled={!canExport}
          >
            {t('endpoint.export')}
          </Button>
          <Button type="button" variant="secondary" icon={<X size={15} />} onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ModeOption({
  active,
  onClick,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
        active
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 dark:border-indigo-500 shadow-sm'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
            active
              ? 'border-indigo-500 bg-indigo-500'
              : 'border-gray-300 dark:border-gray-600 bg-transparent'
          }`}
        >
          {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
        </span>
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${active ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-gray-200'}`}>
            {title}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}
