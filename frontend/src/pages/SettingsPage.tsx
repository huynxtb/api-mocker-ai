import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { settingsApi } from '../services/api';
import Button from '../components/common/Button';

const AI_PROVIDERS = [
  {
    value: 'openai',
    label: 'settings.providers.openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4 Turbo',
    logo: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.843-3.372L15.115 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.403-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
      </svg>
    ),
  },
  {
    value: 'gemini',
    label: 'settings.providers.gemini',
    name: 'Gemini',
    description: 'Gemini 1.5 Pro, Flash',
    logo: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm0 2.118c.72 0 1.407.1 2.062.274L12 7.647 9.938 2.392A9.88 9.88 0 0 1 12 2.118zm-3.23.617L10.686 8.4 5.13 6.04a9.892 9.892 0 0 1 3.64-3.305zM2.118 12c0-.72.1-1.407.274-2.062L7.647 12l-5.255 2.062A9.88 9.88 0 0 1 2.118 12zm.617 3.23L8.4 13.314 6.04 18.87a9.892 9.892 0 0 1-3.305-3.64zM12 21.882a9.88 9.88 0 0 1-2.062-.274L12 16.353l2.062 5.255A9.88 9.88 0 0 1 12 21.882zm3.23-.617L13.314 15.6l5.556 2.36a9.892 9.892 0 0 1-3.64 3.305zM16.353 12l5.255-2.062a9.88 9.88 0 0 1 0 4.124L16.353 12zm1.607-5.13L12.4 8.4 14.76 2.844a9.892 9.892 0 0 1 3.2 4.026z" />
      </svg>
    ),
  },
  {
    value: 'grok',
    label: 'settings.providers.grok',
    name: 'Grok',
    description: 'Grok-2, Grok Vision',
    logo: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function SettingsPage() {
  const { t } = useTranslation();
  const [aiProvider, setAiProvider] = useState('openai');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [grokApiKey, setGrokApiKey] = useState('');
  const [openaiModel, setOpenaiModel] = useState('gpt-4o-mini');
  const [geminiModel, setGeminiModel] = useState('gemini-1.5-flash');
  const [grokModel, setGrokModel] = useState('grok-2-latest');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [missingKey, setMissingKey] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    settingsApi.get().then((res) => {
      const s = res.data.data;
      setAiProvider(s.aiProvider);
      setOpenaiApiKey(s.openaiApiKey);
      setGeminiApiKey(s.geminiApiKey);
      setGrokApiKey(s.grokApiKey);
      setOpenaiModel(s.openaiModel || 'gpt-4o-mini');
      setGeminiModel(s.geminiModel || 'gemini-1.5-flash');
      setGrokModel(s.grokModel || 'grok-2-latest');
      const keyMap: Record<string, boolean> = {
        openai: s.hasOpenaiKey,
        gemini: s.hasGeminiKey,
        grok: s.hasGrokKey,
      };
      setMissingKey(!keyMap[s.aiProvider]);
    }).finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await settingsApi.update({ aiProvider, openaiApiKey, geminiApiKey, grokApiKey, openaiModel, geminiModel, grokModel });
      toast.success(t('settings.saveSuccess'));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  const currentKeyValue =
    aiProvider === 'openai' ? openaiApiKey
    : aiProvider === 'gemini' ? geminiApiKey
    : grokApiKey;

  const setCurrentKey = (val: string) => {
    if (aiProvider === 'openai') setOpenaiApiKey(val);
    else if (aiProvider === 'gemini') setGeminiApiKey(val);
    else setGrokApiKey(val);
  };

  const currentModelValue =
    aiProvider === 'openai' ? openaiModel
    : aiProvider === 'gemini' ? geminiModel
    : grokModel;

  const setCurrentModel = (val: string) => {
    if (aiProvider === 'openai') setOpenaiModel(val);
    else if (aiProvider === 'gemini') setGeminiModel(val);
    else setGrokModel(val);
  };

  const activeProvider = AI_PROVIDERS.find((p) => p.value === aiProvider)!;

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
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          {t('settings.title')}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure your AI provider and API credentials.
        </p>
      </div>

      {/* Missing key alert */}
      {missingKey && (
        <div className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 dark:border-amber-700/50 dark:bg-amber-900/20">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-amber-500 dark:text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
            {t('settings.missingKey')}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Provider selection card */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/60">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              {t('settings.aiProvider')}
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-3">
              {AI_PROVIDERS.map((provider) => {
                const isSelected = aiProvider === provider.value;
                return (
                  <button
                    key={provider.value}
                    type="button"
                    onClick={() => { setAiProvider(provider.value); setShowKey(false); }}
                    className={`relative flex flex-col items-center gap-2.5 rounded-xl border-2 px-3 py-4 text-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 dark:border-indigo-500 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500">
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="currentColor">
                          <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                        </svg>
                      </span>
                    )}
                    <span className={`${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {provider.logo}
                    </span>
                    <div>
                      <p className={`text-sm font-semibold leading-tight ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-gray-200'}`}>
                        {provider.name}
                      </p>
                      <p className={`text-xs mt-0.5 leading-tight ${isSelected ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {provider.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* API key card */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center gap-2">
            <span className={`text-gray-500 dark:text-gray-400`}>{activeProvider.logo}</span>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              {activeProvider.name} {t('settings.apiKey')}
            </h2>
          </div>
          <div className="p-6">
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={currentKeyValue}
                onChange={(e) => setCurrentKey(e.target.value)}
                placeholder={t('settings.apiKeyPlaceholder')}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 pr-10 font-mono text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                tabIndex={-1}
                aria-label={showKey ? 'Hide API key' : 'Show API key'}
              >
                {showKey ? (
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                    <path d="M10.748 13.93l2.523 2.523a10.003 10.003 0 01-8.032-2.836 1.651 1.651 0 010-1.185 10.003 10.003 0 012.036-3.048l1.82 1.82a2.5 2.5 0 002.5 2.5l-.847.727z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Your API key is stored locally and never shared.
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('settings.model')}
              </label>
              <input
                type="text"
                value={currentModelValue}
                onChange={(e) => setCurrentModel(e.target.value)}
                placeholder={t('settings.modelPlaceholder')}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 font-mono text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
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
