import * as React from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      aria-label="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      data-slot="pagination"
      role="navigation"
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul className={cn('flex items-center gap-1', className)} data-slot="pagination-content" {...props} />;
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'a'>;

function PaginationLink({ className, isActive, size = 'icon-xs', ...props }: PaginationLinkProps) {
  return (
    <Button asChild className={cn(className)} size={size} variant={isActive ? 'outline' : 'ghost'}>
      {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
      <a aria-current={isActive ? 'page' : undefined} data-active={isActive} data-slot="pagination-link" {...props} />
    </Button>
  );
}

function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink aria-label="Go to previous page" className={cn('px-0 ps-2!', className)} size="icon-xs" {...props}>
      <ChevronLeftIcon className="rtl:rotate-180" data-icon="inline-start" />
    </PaginationLink>
  );
}

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink aria-label="Go to next page" className={cn('px-0 pe-2!', className)} size="icon-xs" {...props}>
      <ChevronRightIcon className="rtl:rotate-180" data-icon="inline-end" />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      className={cn("flex items-center justify-center [&_svg:not([class*='size-'])]:size-3", className)}
      data-slot="pagination-ellipsis"
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
