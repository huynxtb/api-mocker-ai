import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 focus-visible:ring-indigo-500',
  secondary:
    'text-slate-700 dark:text-slate-100 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 border border-transparent focus-visible:ring-slate-400',
  danger:
    'text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/30 focus-visible:ring-red-500',
  success:
    'text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30 focus-visible:ring-emerald-500',
  info:
    'text-white bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-400 hover:to-sky-500 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 focus-visible:ring-blue-500',
  ghost:
    'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 focus-visible:ring-gray-400',
  outline:
    'text-indigo-700 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-700/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:border-indigo-300 dark:hover:border-indigo-600 focus-visible:ring-indigo-500',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-sm gap-2 rounded-lg',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    loading,
    fullWidth,
    disabled,
    children,
    className,
    type = 'button',
    ...rest
  },
  ref,
) {
  const iconNode = loading ? <Loader2 className="animate-spin" size={size === 'sm' ? 13 : 15} /> : icon;
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center font-semibold transition-all duration-150 select-none active:scale-[0.98]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        sizeClasses[size],
        variantClasses[variant],
        fullWidth ? 'w-full' : '',
        className || '',
      ].join(' ')}
      {...rest}
    >
      {iconPosition === 'left' && iconNode}
      {children}
      {iconPosition === 'right' && iconNode}
    </button>
  );
});

export default Button;
