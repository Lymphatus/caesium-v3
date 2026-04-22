import * as React from 'react';
import { LoaderCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

function Spinner({ className, ...props }: React.ComponentProps<typeof LoaderCircle>) {
  return <LoaderCircle className={cn('animate-spin', className)} data-slot="spinner" {...props} />;
}

export { Spinner };
