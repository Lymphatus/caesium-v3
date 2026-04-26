import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import useFileListStore from '@/stores/file-list.store.ts';

function getPageRange(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
}

function FileListPagination() {
  const currentPage = useFileListStore((state) => state.currentPage);
  const totalFiles = useFileListStore((state) => state.totalFiles);
  const setCurrentPage = useFileListStore((state) => state.setCurrentPage);
  const totalPages = Math.ceil(totalFiles / 50);

  if (totalPages === 0) {
    return null;
  }

  const pages = getPageRange(currentPage, totalPages);
  const goTo = (page: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            aria-disabled={currentPage <= 1}
            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
            href="#"
            onClick={goTo(currentPage - 1)}
          />
        </PaginationItem>
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink href="#" isActive={p === currentPage} onClick={goTo(p)}>
                {p}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            aria-disabled={currentPage >= totalPages}
            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
            href="#"
            onClick={goTo(currentPage + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default FileListPagination;
