import * as React from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <ScrollArea
      className="size-full [&>[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:!top-10 [&>[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:h-[calc(100%-2.5rem)]"
      data-slot="table-container"
    >
      <table className={cn('w-full caption-bottom text-sm', className)} data-slot="table" {...props} />
    </ScrollArea>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      className={cn('bg-muted [&_tr]:hover:bg-muted/50 text-sm [&_tr]:border-b', className)}
      data-slot="table-header"
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} data-slot="table-body" {...props} />;
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      className={cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', className)}
      data-slot="table-footer"
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      className={cn(
        'hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors',
        className,
      )}
      data-slot="table-row"
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'text-foreground h-10 px-3 text-start align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pe-0',
        className,
      )}
      data-slot="table-head"
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      className={cn('p-3 align-middle text-sm whitespace-nowrap [&:has([role=checkbox])]:pe-0', className)}
      data-slot="table-cell"
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption className={cn('text-muted-foreground mt-4 text-sm', className)} data-slot="table-caption" {...props} />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
