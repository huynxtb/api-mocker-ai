import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface Alert {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface AlertContextType {
  showAlert: (type: 'success' | 'error', message: string, options?: { id?: string }) => void;
}

const AlertContext = createContext<AlertContextType>({ showAlert: () => {} });

export function useAlert() {
  return useContext(AlertContext);
}

let counter = 0;

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const showAlert = useCallback(
    (type: 'success' | 'error', message: string, options?: { id?: string }) => {
      const id = options?.id || `alert-${++counter}`;

      setAlerts((prev) => {
        const filtered = prev.filter((a) => a.id !== id);
        return [...filtered, { id, type, message }];
      });

      if (timersRef.current[id]) {
        clearTimeout(timersRef.current[id]);
      }

      const duration = type === 'success' ? 4000 : 7000;
      timersRef.current[id] = setTimeout(() => {
        dismissAlert(id);
      }, duration);
    },
    [dismissAlert],
  );

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <AlertDisplay alerts={alerts} onDismiss={dismissAlert} />
    </AlertContext.Provider>
  );
}

function AlertDisplay({ alerts, onDismiss }: { alerts: Alert[]; onDismiss: (id: string) => void }) {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-lg px-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          role="alert"
          className={[
            'flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg',
            alert.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/90 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
          ].join(' ')}
        >
          {alert.type === 'success' ? (
            <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-500 dark:text-emerald-400" />
          ) : (
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500 dark:text-red-400" />
          )}
          <p className="flex-1 text-sm font-medium leading-relaxed">{alert.message}</p>
          <button
            onClick={() => onDismiss(alert.id)}
            className="shrink-0 p-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
