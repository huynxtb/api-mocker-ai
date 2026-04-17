import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { settingsApi } from '../services/api';
import { AiAccount, AiProviderType } from '../types';
import Button from '../components/common/Button';

type ProviderMeta = { value: AiProviderType; name: string; description: string };

const PROVIDERS: ProviderMeta[] = [
  { value: 'openai', name: 'OpenAI', description: 'GPT-4o, GPT-4 Turbo' },
  { value: 'gemini', name: 'Gemini', description: 'Gemini 1.5 Pro, Flash' },
  { value: 'grok', name: 'Grok', description: 'Grok-2, Grok Vision' },
];

const DEFAULT_MODELS: Record<AiProviderType, string> = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-1.5-flash',
  grok: 'grok-2-latest',
};

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function providerBadge(provider: AiProviderType): string {
  return PROVIDERS.find((p) => p.value === provider)?.name || provider;
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { showAlert } = useAlert();

  const [accounts, setAccounts] = useState<AiAccount[]>([]);
  const [primaryAccountId, setPrimaryAccountId] = useState<string>('');
  const [fallbackAccountIds, setFallbackAccountIds] = useState<string[]>([]);
  const [ready, setReady] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    settingsApi.get()
      .then((res) => {
        const s = res.data.data;
        setAccounts(s.accounts || []);
        setPrimaryAccountId(s.primaryAccountId || '');
        setFallbackAccountIds(s.fallbackAccountIds || []);
        setReady(Boolean(s.ready));
      })
      .finally(() => setLoading(false));
  }, []);

  const accountsById = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  const availableForChain = useMemo(() => {
    const used = new Set([primaryAccountId, ...fallbackAccountIds].filter(Boolean));
    return (currentId: string) => accounts.filter((a) => a.id === currentId || !used.has(a.id));
  }, [accounts, primaryAccountId, fallbackAccountIds]);

  function addAccount(provider: AiProviderType) {
    const newAccount: AiAccount = {
      id: generateId(),
      provider,
      label: `${providerBadge(provider)} ${accounts.filter((a) => a.provider === provider).length + 1}`,
      apiKey: '',
      model: DEFAULT_MODELS[provider],
    };
    setAccounts((prev) => [...prev, newAccount]);
    if (!primaryAccountId) setPrimaryAccountId(newAccount.id);
  }

  function updateAccount(id: string, patch: Partial<AiAccount>) {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function deleteAccount(id: string) {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    if (primaryAccountId === id) setPrimaryAccountId('');
    setFallbackAccountIds((prev) => prev.filter((fid) => fid !== id));
  }

  function toggleKeyVisible(id: string) {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function addFallback() {
    setFallbackAccountIds((prev) => [...prev, '']);
  }

  function updateFallback(index: number, id: string) {
    setFallbackAccountIds((prev) => prev.map((v, i) => (i === index ? id : v)));
  }

  function removeFallback(index: number) {
    setFallbackAccountIds((prev) => prev.filter((_, i) => i !== index));
  }

  function moveFallback(index: number, dir: -1 | 1) {
    setFallbackAccountIds((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const cleanedFallbacks = fallbackAccountIds.filter((id) => id && accountsById.has(id));
      const res = await settingsApi.update({
        accounts,
        primaryAccountId,
        fallbackAccountIds: cleanedFallbacks,
      });
      const s = res.data.data;
      setAccounts(s.accounts || []);
      setPrimaryAccountId(s.primaryAccountId || '');
      setFallbackAccountIds(s.fallbackAccountIds || []);
      setReady(Boolean(s.ready));
      showAlert('success', t('settings.saveSuccess'));
    } catch {
      showAlert('error', t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          {t('settings.title')}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('settings.subtitle')}
        </p>
      </div>

      {!ready && (
        <div className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 dark:border-amber-700/50 dark:bg-amber-900/20">
          <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
            {t('settings.notReady')}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Accounts */}
        <section className="rounded-xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/60">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              {t('settings.accounts.title')}
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('settings.accounts.subtitle')}
            </p>
          </div>

          <div className="p-6 space-y-4">
            {accounts.length === 0 && (
              <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                {t('settings.accounts.empty')}
              </div>
            )}

            {accounts.map((account) => (
              <AccountRow
                key={account.id}
                account={account}
                isPrimary={account.id === primaryAccountId}
                keyVisible={Boolean(visibleKeys[account.id])}
                onToggleKey={() => toggleKeyVisible(account.id)}
                onChange={(patch) => updateAccount(account.id, patch)}
                onDelete={() => deleteAccount(account.id)}
                t={t}
              />
            ))}

            <div className="flex flex-wrap gap-2 pt-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => addAccount(p.value)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <Plus size={14} />
                  {t('settings.accounts.add')} {p.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Execution chain */}
        <section className="rounded-xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/60">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              {t('settings.chain.title')}
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('settings.chain.subtitle')}
            </p>
          </div>

          <div className="p-6 space-y-3">
            {accounts.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.chain.noAccounts')}
              </p>
            ) : (
              <>
                <ChainSlot
                  badge={t('settings.chain.primary')}
                  accent
                  value={primaryAccountId}
                  options={availableForChain(primaryAccountId)}
                  onChange={setPrimaryAccountId}
                  placeholder={t('settings.chain.selectAccount')}
                  t={t}
                />

                {fallbackAccountIds.map((id, idx) => (
                  <ChainSlot
                    key={`fb-${idx}`}
                    badge={t('settings.chain.fallback', { index: idx + 1 })}
                    value={id}
                    options={availableForChain(id)}
                    onChange={(v) => updateFallback(idx, v)}
                    placeholder={t('settings.chain.selectAccount')}
                    onRemove={() => removeFallback(idx)}
                    onMoveUp={idx > 0 ? () => moveFallback(idx, -1) : undefined}
                    onMoveDown={idx < fallbackAccountIds.length - 1 ? () => moveFallback(idx, 1) : undefined}
                    t={t}
                  />
                ))}

                <button
                  type="button"
                  onClick={addFallback}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <Plus size={14} />
                  {t('settings.chain.addFallback')}
                </button>
              </>
            )}
          </div>
        </section>

        <div className="flex justify-end">
          <Button
            variant="primary"
            icon={<Save size={15} />}
            loading={saving}
            onClick={handleSave}
          >
            {saving ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AccountRow({
  account,
  isPrimary,
  keyVisible,
  onToggleKey,
  onChange,
  onDelete,
  t,
}: {
  account: AiAccount;
  isPrimary: boolean;
  keyVisible: boolean;
  onToggleKey: () => void;
  onChange: (patch: Partial<AiAccount>) => void;
  onDelete: () => void;
  t: (k: string, o?: Record<string, unknown>) => string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 p-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 uppercase tracking-wide">
          {providerBadge(account.provider)}
        </span>
        {isPrimary && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 uppercase tracking-wide">
            {t('settings.chain.primary')}
          </span>
        )}
        <div className="ml-auto">
          <button
            type="button"
            onClick={onDelete}
            title={t('settings.accounts.delete')}
            className="p-1.5 rounded-md text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {t('settings.accounts.label')}
          </label>
          <input
            type="text"
            value={account.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder={t('settings.accounts.labelPlaceholder')}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900/50 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {t('settings.model')}
          </label>
          <input
            type="text"
            value={account.model}
            onChange={(e) => onChange({ model: e.target.value })}
            placeholder={DEFAULT_MODELS[account.provider]}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900/50 px-3 py-2 font-mono text-sm text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {t('settings.apiKey')}
          </label>
          <div className="relative">
            <input
              type={keyVisible ? 'text' : 'password'}
              value={account.apiKey}
              onChange={(e) => onChange({ apiKey: e.target.value })}
              placeholder={t('settings.apiKeyPlaceholder')}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900/50 px-3 py-2 pr-10 font-mono text-sm text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
            />
            <button
              type="button"
              onClick={onToggleKey}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              tabIndex={-1}
              aria-label={keyVisible ? 'Hide' : 'Show'}
            >
              {keyVisible ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChainSlot({
  badge,
  accent,
  value,
  options,
  onChange,
  placeholder,
  onRemove,
  onMoveUp,
  onMoveDown,
  t,
}: {
  badge: string;
  accent?: boolean;
  value: string;
  options: AiAccount[];
  onChange: (v: string) => void;
  placeholder: string;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  t: (k: string) => string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide flex-shrink-0 w-24 justify-center ${
          accent
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        }`}
      >
        {badge}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900/50 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
      >
        <option value="">{placeholder}</option>
        {options.map((a) => (
          <option key={a.id} value={a.id}>
            {a.label || providerBadge(a.provider)} · {providerBadge(a.provider)} · {a.model}
          </option>
        ))}
      </select>
      {onRemove && (
        <>
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!onMoveUp}
            title={t('settings.chain.moveUp')}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!onMoveDown}
            title={t('settings.chain.moveDown')}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
          >
            <ArrowDown size={14} />
          </button>
        </>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          title={t('settings.chain.remove')}
          className="p-1.5 rounded-md text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
