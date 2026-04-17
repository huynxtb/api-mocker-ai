import { ReactNode } from 'react';
import LanguageSwitcher from '../common/LanguageSwitcher';
import ThemeToggle from '../common/ThemeToggle';

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthShell({ title, subtitle, children }: Props) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-indigo-400/30 dark:bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[380px] h-[380px] rounded-full bg-fuchsia-400/20 dark:bg-fuchsia-600/15 blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/3 w-[360px] h-[360px] rounded-full bg-sky-400/20 dark:bg-sky-600/15 blur-3xl" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
        aria-hidden="true"
      />

      {/* Top right controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
              <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" aria-hidden="true">
                <path d="M9 11h14l-1 10H10L9 11z" fill="#C7D2FE" opacity="0.7" />
                <path d="M8 9h16a1 1 0 0 1 1 1v1H7v-1a1 1 0 0 1 1-1z" fill="#EEF2FF" />
                <circle cx="10" cy="10" r="0.8" fill="#EF4444" />
                <circle cx="12.5" cy="10" r="0.8" fill="#F59E0B" />
                <circle cx="15" cy="10" r="0.8" fill="#10B981" />
                <path d="M13 16h6M13 19h4" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M22 14l3-3m0 0l-1.5-1m1.5 1l-1.5 1" stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              API Mocker <span className="text-indigo-600 dark:text-indigo-400">AI</span>
            </h1>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-xl shadow-gray-900/5 dark:shadow-black/30 px-6 py-7 sm:px-8 sm:py-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                {title}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            </div>
            {children}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-600">
            API Mocker AI · Secure admin access
          </p>
        </div>
      </div>
    </div>
  );
}
