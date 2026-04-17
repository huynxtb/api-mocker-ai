import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { projectApi, endpointApi } from '../services/api';
import { Project, ApiEndpoint } from '../types';
import {
  Plus,
  ArrowLeft,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Layers,
  FilePlus2,
  FolderPlus,
} from 'lucide-react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import CreateResourceModal from '../components/endpoint/CreateResourceModal';
import AddEndpointModal from '../components/endpoint/AddEndpointModal';
import Button from '../components/common/Button';
import IconButton from '../components/common/IconButton';

const METHOD_COLORS: Record<string, string> = {
  GET:    'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-700/50',
  POST:   'bg-blue-100   text-blue-700   ring-1 ring-blue-200   dark:bg-blue-900/40   dark:text-blue-300   dark:ring-blue-700/50',
  PUT:    'bg-amber-100  text-amber-700  ring-1 ring-amber-200  dark:bg-amber-900/40  dark:text-amber-300  dark:ring-amber-700/50',
  DELETE: 'bg-rose-100   text-rose-700   ring-1 ring-rose-200   dark:bg-rose-900/40   dark:text-rose-300   dark:ring-rose-700/50',
  PATCH:  'bg-violet-100 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:ring-violet-700/50',
};

const METHOD_WIDTH: Record<string, string> = {
  GET:    'w-[52px]',
  POST:   'w-[52px]',
  PUT:    'w-[44px]',
  DELETE: 'w-[64px]',
  PATCH:  'w-[60px]',
};

export default function EndpointListPage() {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteBasePath, setDeleteBasePath] = useState<string | null>(null);
  const [showCreateResource, setShowCreateResource] = useState(false);
  const [showAddEndpoint, setShowAddEndpoint] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, [projectId]);

  async function loadData() {
    try {
      const [projRes, epRes] = await Promise.all([
        projectApi.get(projectId!),
        endpointApi.list(projectId!),
      ]);
      setProject(projRes.data.data);
      setEndpoints(epRes.data.data);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await endpointApi.delete(projectId!, deleteId);
      toast.success(t('endpoint.deleteSuccess'));
      setEndpoints(endpoints.filter((e) => e._id !== deleteId));
    } catch {
      toast.error(t('common.error'));
    }
    setDeleteId(null);
  }

  async function handleDeleteResource() {
    if (!deleteBasePath) return;
    try {
      await endpointApi.deleteResource(projectId!, deleteBasePath);
      toast.success(t('endpoint.deleteResourceSuccess'));
      setEndpoints(endpoints.filter((e) => e.basePath !== deleteBasePath));
      setCollapsedGroups((prev) => {
        const next = { ...prev };
        delete next[deleteBasePath];
        return next;
      });
    } catch {
      toast.error(t('common.error'));
    }
    setDeleteBasePath(null);
  }

  function handleResourceCreated() {
    setShowCreateResource(false);
    loadData();
  }

  function handleEndpointAdded() {
    setShowAddEndpoint(false);
    loadData();
  }

  const grouped = endpoints.reduce<Record<string, ApiEndpoint[]>>((acc, ep) => {
    if (!acc[ep.basePath]) acc[ep.basePath] = [];
    acc[ep.basePath]!.push(ep);
    return acc;
  }, {});
  const groupKeys = Object.keys(grouped);
  const hasResources = groupKeys.length > 0;
  const allCollapsed = groupKeys.length > 0 && groupKeys.every((k) => collapsedGroups[k]);

  function toggleAll() {
    const next: Record<string, boolean> = {};
    groupKeys.forEach((k) => { next[k] = !allCollapsed; });
    setCollapsedGroups(next);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-indigo-500" size={28} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-1">
      <Button
        variant="ghost"
        size="sm"
        icon={<ArrowLeft size={15} />}
        onClick={() => navigate('/')}
        className="mb-5 !px-2"
      >
        {t('common.back')}
      </Button>

      <div className="flex items-start justify-between gap-4 mb-7">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white truncate">
            {project?.name}
            <span className="text-gray-400 dark:text-gray-500 font-normal mx-2">/</span>
            <span className="text-gray-600 dark:text-gray-300">{t('endpoint.title')}</span>
          </h1>
          {project?.description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">{project.description}</p>
          )}
          {project?.apiPrefix && (
            <code className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
              {project.apiPrefix}
            </code>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasResources && (
            <Button
              variant="outline"
              icon={<FilePlus2 size={15} />}
              onClick={() => setShowAddEndpoint(true)}
            >
              {t('endpoint.addEndpoint')}
            </Button>
          )}
          <Button
            variant="primary"
            icon={<FolderPlus size={15} />}
            onClick={() => setShowCreateResource(true)}
          >
            {t('endpoint.createResource')}
          </Button>
        </div>
      </div>

      {hasResources && groupKeys.length > 1 && (
        <div className="flex justify-end mb-3">
          <Button
            variant="ghost"
            size="sm"
            icon={allCollapsed ? <ChevronsUpDown size={13} /> : <ChevronsDownUp size={13} />}
            onClick={toggleAll}
            className="!text-xs !text-gray-400 dark:!text-gray-500 hover:!text-indigo-600 dark:hover:!text-indigo-400"
          >
            {allCollapsed ? t('endpoint.expandAll') : t('endpoint.collapseAll')}
          </Button>
        </div>
      )}

      {endpoints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700/60 mb-4">
            <Layers size={22} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('common.noData')}</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {t('endpoint.createResource')}
          </p>
          <div className="mt-5">
            <Button
              variant="primary"
              icon={<Plus size={15} />}
              onClick={() => setShowCreateResource(true)}
            >
              {t('endpoint.createResource')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(grouped).map(([basePath, eps]) => {
            const isCollapsed = !!collapsedGroups[basePath];
            return (
              <div
                key={basePath}
                className="rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800 overflow-hidden shadow-sm"
              >
                <div
                  className={`w-full px-4 py-3 flex items-center gap-2.5 bg-gray-50/80 dark:bg-gray-700/40 hover:bg-gray-100/80 dark:hover:bg-gray-700/70 transition-colors select-none ${!isCollapsed ? 'border-b border-gray-200 dark:border-gray-700/80' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsedGroups((prev) => ({ ...prev, [basePath]: !prev[basePath] }))
                    }
                    className="flex-1 flex items-center gap-2.5 text-left"
                  >
                    <span className="text-gray-400 dark:text-gray-500 shrink-0">
                      {isCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                    </span>
                    <span className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
                      /{basePath}
                    </span>
                    <span className="ml-1 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[11px] font-medium bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                      {eps.length}
                    </span>
                  </button>
                  <IconButton
                    size="sm"
                    tone="danger"
                    aria-label={t('endpoint.deleteResource')}
                    title={t('endpoint.deleteResource')}
                    icon={<Trash2 size={14} />}
                    onClick={(e) => { e.stopPropagation(); setDeleteBasePath(basePath); }}
                    className="!text-red-500 dark:!text-red-400"
                  />
                </div>

                {!isCollapsed && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                    {eps.map((ep) => (
                      <div
                        key={ep._id}
                        onClick={() => navigate(`/projects/${projectId}/endpoints/${ep._id}`)}
                        className="group flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-all"
                      >
                        <span
                          className={`shrink-0 inline-flex items-center justify-center h-5 rounded-full text-[10px] font-bold tracking-wide px-2.5 ${METHOD_WIDTH[ep.httpMethod] ?? 'w-auto'} ${METHOD_COLORS[ep.httpMethod] ?? 'bg-gray-100 text-gray-600 ring-1 ring-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:ring-gray-600'}`}
                        >
                          {ep.httpMethod}
                        </span>

                        <span className="flex-1 min-w-0 font-mono text-sm text-gray-700 dark:text-gray-200 truncate">
                          {ep.fullPath}
                        </span>

                        <span className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                          {ep.name}
                        </span>

                        <span className="shrink-0 flex items-center gap-1.5">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${ep.generatedData ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                            title={ep.generatedData ? 'Data ready' : 'No data'}
                          />
                        </span>

                        <IconButton
                          size="sm"
                          tone="danger"
                          aria-label={t('common.delete')}
                          icon={<Trash2 size={14} />}
                          onClick={(e) => { e.stopPropagation(); setDeleteId(ep._id); }}
                          className="!text-red-500 dark:!text-red-400"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        message={t('endpoint.deleteConfirm')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        open={deleteBasePath !== null}
        message={t('endpoint.deleteResourceConfirm', {
          basePath: deleteBasePath ?? '',
          count: deleteBasePath ? (grouped[deleteBasePath]?.length ?? 0) : 0,
        })}
        onConfirm={handleDeleteResource}
        onCancel={() => setDeleteBasePath(null)}
      />

      {showCreateResource && (
        <CreateResourceModal
          projectId={projectId!}
          onClose={() => setShowCreateResource(false)}
          onCreated={handleResourceCreated}
        />
      )}

      {showAddEndpoint && (
        <AddEndpointModal
          projectId={projectId!}
          basePaths={Object.keys(grouped)}
          onClose={() => setShowAddEndpoint(false)}
          onAdded={handleEndpointAdded}
        />
      )}
    </div>
  );
}
