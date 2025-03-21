import FileListTable from '@/components/FileListTable.tsx';
import FileListPagination from '@/components/FileListPagination.tsx';

function ListPanel() {
  return (
    <div className="size-full">
      <div className="bg-content1 size-full rounded flex flex-col gap-1">
        <FileListTable></FileListTable>
        <div className="flex items-center justify-center">
          <div>
            <FileListPagination></FileListPagination>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListPanel;
