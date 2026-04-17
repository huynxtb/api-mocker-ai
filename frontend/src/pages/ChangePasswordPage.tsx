import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { KeyRound, Save, X } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AuthInput from '../components/auth/AuthInput';
import Button from '../components/common/Button';

const LockIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  </svg>
);

export default function ChangePasswordPage() {
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) {
      showAlert('error', t('auth.passwordMismatch'));
      return;
    }
    if (newPassword.length < 6) {
      showAlert('error', t('auth.passwordTooShort'));
      return;
    }
    setSubmitting(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      showAlert('success', t('auth.changePasswordSuccess'));
      await logout();
      navigate('/login');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        t('common.error');
      showAlert('error', msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          {t('auth.changePasswordTitle')}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('auth.changePasswordSubtitle')}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/60 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 flex items-center gap-3">
          <div className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
            <KeyRound size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('auth.signedInAs')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <AuthInput
            label={t('auth.currentPassword')}
            icon={LockIcon}
            isPassword
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <AuthInput
            label={t('auth.newPassword')}
            icon={LockIcon}
            isPassword
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
          <AuthInput
            label={t('auth.confirmPassword')}
            icon={LockIcon}
            isPassword
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-700/60">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {t('auth.changePasswordHint')}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                icon={<X size={15} />}
                onClick={() => navigate(-1)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={<Save size={15} />}
                loading={submitting}
              >
                {submitting ? t('common.loading') : t('common.save')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
