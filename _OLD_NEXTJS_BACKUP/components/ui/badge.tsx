import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'basic' | 'verified' | 'expert';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'default':
          return 'bg-blue-600 text-white';
        case 'secondary':
          return 'bg-gray-100 text-gray-900';
        case 'destructive':
          return 'bg-red-600 text-white';
        case 'outline':
          return 'border border-gray-300 text-gray-700';
        case 'basic':
          return 'bg-gray-100 text-gray-700';
        case 'verified':
          return 'bg-blue-100 text-blue-800 border border-blue-200';
        case 'expert':
          return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold';
        default:
          return 'bg-blue-600 text-white';
      }
    };

    return (
      <div
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          getVariantStyles(),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };