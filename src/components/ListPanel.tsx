import FileListTable from '@/components/file-list/FileListTable.tsx';
import FileListPagination from '@/components/file-list/FileListPagination.tsx';

function ListPanel() {
  return (
    <div className="size-full">
      <div className="bg-content1 flex size-full flex-col rounded">
        <FileListTable></FileListTable>
        <div className="bg-content2 flex min-h-[40px] items-center justify-center rounded-b p-1">
          <FileListPagination></FileListPagination>
        </div>
      </div>
    </div>
  );
}

export default ListPanel;
