import * as React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', loading = false, disabled, children, ...props }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'default':
          return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
        case 'destructive':
          return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
        case 'outline':
          return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500';
        case 'secondary':
          return 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500';
        case 'ghost':
          return 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500';
        case 'link':
          return 'text-blue-600 underline-offset-4 hover:underline focus:ring-blue-500';
        default:
          return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return 'h-8 px-3 text-sm';
        case 'lg':
          return 'h-12 px-8 text-lg';
        case 'icon':
          return 'h-10 w-10';
        default:
          return 'h-10 px-6';
      }
    };

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          getVariantStyles(),
          getSizeStyles(),
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };