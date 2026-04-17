import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertProvider, useAlert } from './context/AlertContext';
import Layout from './components/layout/Layout';
import ProjectListPage from './pages/ProjectListPage';
import ProjectFormPage from './pages/ProjectFormPage';
import EndpointListPage from './pages/EndpointListPage';
import EndpointDetailPage from './pages/EndpointDetailPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterSystemAccountPage from './pages/RegisterSystemAccountPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import { settingsApi } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';

function SettingsGuard({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/settings') return;

    settingsApi.get().then((res) => {
      const s = res.data.data;
      const providerKeyMap: Record<string, boolean> = {
        openai: s.hasOpenaiKey,
        gemini: s.hasGeminiKey,
        grok: s.hasGrokKey,
      };
      if (!providerKeyMap[s.aiProvider]) {
        showAlert('error', t('endpoint.configRequired'), { id: 'config-required' });
        navigate('/settings');
      }
    }).catch(() => {
      // API not reachable yet, skip check
    });
  }, [location.pathname, navigate, t, showAlert]);

  return <>{children}</>;
}

function LoadingScreen() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
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

function AppRoutes() {
  const { status } = useAuth();

  if (status === 'loading') return <LoadingScreen />;

  if (status === 'no-account') {
    return (
      <Routes>
        <Route path="/setup" element={<RegisterSystemAccountPage />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // authenticated
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route
          path="*"
          element={
            <SettingsGuard>
              <Routes>
                <Route path="/" element={<ProjectListPage />} />
                <Route path="/projects/new" element={<ProjectFormPage />} />
                <Route path="/projects/:id/edit" element={<ProjectFormPage />} />
                <Route path="/projects/:projectId/endpoints" element={<EndpointListPage />} />
                <Route path="/projects/:projectId/endpoints/:endpointId" element={<EndpointDetailPage />} />
              </Routes>
            </SettingsGuard>
          }
        />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </AlertProvider>
  );
}
