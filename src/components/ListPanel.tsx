import FileListTable from '@/components/FileListTable.tsx';

function ListPanel() {
  return (
    <div className="size-full">
      <div className="bg-background size-full rounded">
        <FileListTable></FileListTable>
      </div>
    </div>
  );
}

export default ListPanel;
