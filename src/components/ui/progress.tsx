import * as React from 'react';
import { Progress as ProgressPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

function Progress({
  className,
  value,
  disableAnimations = false,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { disableAnimations?: boolean }) {
  const isIndeterminate = value === undefined || value === null;

  return (
    <ProgressPrimitive.Root
      className={cn('bg-primary/20 relative h-2 w-full overflow-hidden rounded-full', className)}
      data-slot="progress"
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          'bg-primary h-full w-full flex-1 rounded-full',
          !disableAnimations && 'transition-all',
          'data-[state=indeterminate]:w-1/3 data-[state=indeterminate]:animate-[progress-indeterminate_1.5s_ease-in-out_infinite]',
        )}
        data-slot="progress-indicator"
        style={isIndeterminate ? undefined : { transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
