import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { projectApi } from '../services/api';
import { useAlert } from '../context/AlertContext';
import { Project } from '../types';
import { Trash2, Pencil, ArrowRight, Plus, Loader2, FolderOpen, Search } from 'lucide-react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/common/Button';
import IconButton from '../components/common/IconButton';

export default function ProjectListPage() {
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const res = await projectApi.list();
      setProjects(res.data.data);
    } catch {
      showAlert('error', t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await projectApi.delete(deleteId);
      showAlert('success', t('project.deleteSuccess'));
      setProjects(projects.filter((p) => p._id !== deleteId));
    } catch {
      showAlert('error', t('common.error'));
    }
    setDeleteId(null);
  }

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-indigo-500" size={36} />
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-1">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            {t('project.title')}
          </h1>
          <span className="inline-flex items-center justify-center min-w-[1.75rem] h-7 px-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold tabular-nums">
            {projects.length}
          </span>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/projects/new')}
        >
          {t('common.create')}
        </Button>
      </div>

      {/* Search bar */}
      {projects.length > 0 && (
        <div className="relative mb-6">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search')}
            className="w-full sm:w-72 pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150"
          />
        </div>
      )}

      {/* Empty state */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 mb-5">
            <FolderOpen size={32} className="text-indigo-500 dark:text-indigo-400" />
          </div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">
            {t('common.noData')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center max-w-xs">
            {t('project.emptyHint', 'Get started by creating your first API mock project.')}
          </p>
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => navigate('/projects/new')}
          >
            {t('common.create')}
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          <Search size={28} className="text-gray-400 dark:text-gray-500 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('project.noMatch', 'No projects match your search.')}</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onView={() => navigate(`/projects/${project._id}/endpoints`)}
              onEdit={() => navigate(`/projects/${project._id}/edit`)}
              onDelete={() => setDeleteId(project._id)}
              viewLabel={t('project.viewEndpoints')}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        message={t('project.deleteConfirm')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  viewLabel: string;
}

function ProjectCard({ project, onView, onEdit, onDelete, viewLabel }: ProjectCardProps) {
  const { t } = useTranslation();
  const formattedDate = new Date(project.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      onClick={onView}
      className="group relative flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 overflow-hidden cursor-pointer">
      {/* Accent gradient strip on hover */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50 truncate leading-snug">
          {project.name}
        </h3>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {project.description || <span className="italic text-gray-400 dark:text-gray-600">{t('project.noDescription', 'No description')}</span>}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-mono text-gray-600 dark:text-gray-300 truncate max-w-[180px]">
          {project.apiPrefix}
        </span>
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0">
          {formattedDate}
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/60 flex items-center gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); onView(); }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-150"
        >
          {viewLabel}
          <ArrowRight size={14} className="transition-transform duration-150 group-hover:translate-x-0.5" />
        </button>
        <div className="flex-1" />
        <IconButton
          size="sm"
          tone="primary"
          aria-label={t('common.edit')}
          icon={<Pencil size={14} />}
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
        />
        <IconButton
          size="sm"
          tone="danger"
          aria-label={t('common.delete')}
          icon={<Trash2 size={14} />}
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        />
      </div>
    </div>
  );
}
