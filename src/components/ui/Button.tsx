import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-[#165DFF] text-white hover:bg-[#0E42D2] active:bg-[#0A34A8]',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
      outline: 'border-2 border-[#165DFF] text-[#165DFF] hover:bg-[#165DFF] hover:text-white',
      ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
      danger: 'bg-[#E34D59] text-white hover:bg-[#C93D49] active:bg-[#B02D39]',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'rounded-lg font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[#165DFF] focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'hover:shadow-md active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
