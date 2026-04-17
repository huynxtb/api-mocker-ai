import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { projectApi } from '../services/api';
import { ArrowLeft, Loader2, Code2, Copy, Check, Save, X } from 'lucide-react';
import Button from '../components/common/Button';

export default function ProjectFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(!!id);
  const [slug, setSlug] = useState('');
  const [nameError, setNameError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      projectApi.get(id).then((res) => {
        const p = res.data.data;
        setName(p.name);
        setDescription(p.description);
        setSlug(p.apiPrefix);
      }).finally(() => setFetchLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (!isEdit) {
      const s = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setSlug(s ? `${s}/api` : '');
    }
  }, [name, isEdit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(t('common.required'));
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await projectApi.update(id!, { name, description });
        toast.success(t('project.updateSuccess'));
      } else {
        await projectApi.create({ name, description });
        toast.success(t('project.createSuccess'));
      }
      navigate('/');
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-indigo-500" size={36} />
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <Button
        variant="ghost"
        size="sm"
        icon={<ArrowLeft size={15} />}
        onClick={() => navigate(-1)}
        className="mb-6 !px-2"
      >
        {t('common.back')}
      </Button>

      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          {isEdit ? t('project.editTitle') : t('project.createTitle')}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {isEdit ? t('project.editSubtitle', 'Update the project details below.') : t('project.createSubtitle', 'Fill in the details to create a new mock API project.')}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm dark:shadow-none p-7 space-y-6"
      >
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {t('project.name')}
            <span className="ml-1 text-indigo-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError(''); }}
            placeholder={t('project.namePlaceholder')}
            className={[
              'w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 dark:text-gray-100',
              'bg-gray-50 dark:bg-gray-800',
              'border transition-colors outline-none',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              nameError
                ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20',
            ].join(' ')}
          />
          {nameError && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">{nameError}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {t('project.description')}
            <span className="ml-1.5 text-xs font-normal text-gray-400 dark:text-gray-500">{t('common.optional', 'Optional')}</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('project.descriptionPlaceholder')}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none"
          />
        </div>

        {slug && (
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <Code2 size={14} className="text-indigo-500" />
              {t('project.apiPrefix')}
            </label>
            <div className="flex items-center gap-0 rounded-lg border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/40 overflow-hidden">
              <div className="flex-1 px-3.5 py-2.5 font-mono text-sm text-indigo-700 dark:text-indigo-300 truncate">
                {slug}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border-l border-indigo-200 dark:border-indigo-500/30 transition-colors shrink-0"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-green-500" />
                    <span className="text-green-600 dark:text-green-400">{t('common.copied', 'Copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    {t('common.copy', 'Copy')}
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">{t('project.apiPrefixHint')}</p>
          </div>
        )}

        <div className="border-t border-gray-100 dark:border-gray-700/60" />

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" variant="primary" icon={<Save size={15} />} loading={loading}>
            {loading ? t('common.loading') : t('common.save')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            icon={<X size={15} />}
            onClick={() => navigate(-1)}
          >
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
}
