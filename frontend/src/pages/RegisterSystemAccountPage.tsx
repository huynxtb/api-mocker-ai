import { FormEvent, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/auth/AuthShell';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';

const UserIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);
const LockIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  </svg>
);

export default function RegisterSystemAccountPage() {
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const { status, register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') return <Navigate to="/" replace />;
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      showAlert('error', t('auth.passwordMismatch'));
      return;
    }
    if (password.length < 6) {
      showAlert('error', t('auth.passwordTooShort'));
      return;
    }
    setSubmitting(true);
    try {
      await register(username, password);
      showAlert('success', t('auth.registerSuccess'));
      navigate('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        t('auth.registerFailed');
      showAlert('error', msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title={t('auth.setupTitle')} subtitle={t('auth.setupSubtitle')}>
      {/* First-run badge */}
      <div className="mb-5 flex items-center gap-2 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60 bg-indigo-50/80 dark:bg-indigo-950/40 px-3 py-2">
        <svg className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
          {t('auth.setupNotice')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          label={t('auth.username')}
          icon={UserIcon}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
          autoFocus
        />
        <AuthInput
          label={t('auth.password')}
          icon={LockIcon}
          isPassword
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        <AuthButton type="submit" loading={submitting} icon={<UserPlus size={16} />}>
          {submitting ? t('common.loading') : t('auth.setupButton')}
        </AuthButton>
      </form>
    </AuthShell>
  );
}
