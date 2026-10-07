import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 disabled:pointer-events-none select-none rounded-lg';

    const variantStyles = {
      primary:
        'bg-espresso text-cream hover:bg-espresso-muted dark:bg-cream-paper dark:text-espresso dark:hover:bg-white',
      secondary:
        'bg-white text-stone-800 hover:bg-cream border border-border dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700',
      outline:
        'border border-border bg-transparent hover:bg-white/70 text-stone-800 dark:border-stone-700 dark:text-stone-100 dark:hover:bg-stone-800',
      danger: 'bg-red-700 text-white hover:bg-red-800',
      success: 'bg-emerald-800 text-white hover:bg-emerald-900',
      ghost: 'hover:bg-black/5 text-stone-700 dark:hover:bg-white/10 dark:text-stone-300',
      accent: 'bg-accent text-white hover:bg-orange-800',
    };

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-3.5 py-2 gap-2',
      lg: 'text-[15px] px-5 py-3 gap-2 font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
