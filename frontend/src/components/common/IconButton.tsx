import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';

export type IconButtonTone = 'neutral' | 'primary' | 'danger' | 'success' | 'warning';
export type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  tone?: IconButtonTone;
  size?: IconButtonSize;
  'aria-label': string;
}

const toneClasses: Record<IconButtonTone, string> = {
  neutral:
    'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800',
  primary:
    'text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30',
  danger:
    'text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
  success:
    'text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
  warning:
    'text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20',
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'w-7 h-7 rounded-md',
  md: 'w-8 h-8 rounded-lg',
  lg: 'w-10 h-10 rounded-lg',
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, tone = 'neutral', size = 'md', className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={[
        'inline-flex items-center justify-center transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        toneClasses[tone],
        className || '',
      ].join(' ')}
      {...rest}
    >
      {icon}
    </button>
  );
});

export default IconButton;
