import { useTranslation } from 'react-i18next';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import Button from './Button';

interface Props {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, message, onConfirm, onCancel }: Props) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl dark:shadow-black/60 border border-gray-200 dark:border-gray-700/60 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

        <div className="h-1 w-full bg-gradient-to-r from-red-400 via-red-500 to-rose-500" />

        <div className="px-6 pt-6 pb-6">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800/50">
              <AlertTriangle size={22} className="text-red-500 dark:text-red-400" strokeWidth={2} />
            </div>
          </div>

          <h3 className="text-center text-base font-bold text-gray-900 dark:text-white mb-2">
            {t('common.confirmTitle', 'Are you sure?')}
          </h3>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {message}
          </p>

          <div className="flex gap-3 mt-6">
            <Button variant="secondary" icon={<X size={15} />} fullWidth onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" icon={<Trash2 size={15} />} fullWidth onClick={onConfirm}>
              {t('common.confirm')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
