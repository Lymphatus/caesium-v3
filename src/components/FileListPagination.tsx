import { Pagination } from '@heroui/react';
import useFileListStore from '@/stores/file-list.store.ts';

function FileListPagination() {
  const { currentPage, setCurrentPage } = useFileListStore();

  const totalPages = useFileListStore.getState().totalPages();

  const pagination =
    totalPages > 0 ? (
      <Pagination
        isCompact
        showControls
        page={currentPage}
        showShadow={false}
        size="sm"
        total={totalPages}
        onChange={(page) => setCurrentPage(page)}
      />
    ) : null;
  return <div className="flex w-full justify-center">{pagination}</div>;
}

export default FileListPagination;
