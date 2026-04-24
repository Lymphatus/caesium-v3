import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  'bg-input/50 file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 w-full min-w-0 rounded-3xl border border-transparent py-1 text-base transition-[color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm',
  {
    variants: {
      size: {
        default: 'h-9 px-3',
        sm: 'h-8 px-3',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

function Input({
  className,
  type,
  size,
  ...props
}: Omit<React.ComponentProps<'input'>, 'size'> & VariantProps<typeof inputVariants>) {
  return (
    <input
      className={cn(inputVariants({ size }), className)}
      data-size={size}
      data-slot="input"
      type={type}
      {...props}
    />
  );
}

export { Input, inputVariants };
