import FileListTable from '@/components/FileListTable.tsx';
import FileListPagination from '@/components/FileListPagination.tsx';

function ListPanel() {
  return (
    <div className="size-full">
      <div className="bg-content1 flex size-full flex-col gap-1 rounded">
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
