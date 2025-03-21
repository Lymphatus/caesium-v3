import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import useFileListStore from '@/stores/file-list.store.ts';
import { Circle } from 'lucide-react';
import prettyBytes from 'pretty-bytes';

function FileListTable() {
  const { fileList } = useFileListStore();

  return (
    <Table
      selectionMode="multiple"
      shadow="none"
      radius="sm"
      fullWidth
      removeWrapper
      isHeaderSticky
      aria-label="File list"
      onRowAction={(key) => console.log(`Tapped item ${key}...`)}
      classNames={{
        base: 'h-full justify-between overflow-auto',
        th: 'h-8',
      }}
      checkboxesProps={{ disableAnimation: true, size: 'sm' }}
    >
      <TableHeader>
        {/*TODO Translations*/}
        <TableColumn key="status" minWidth={100} align="center">
          &nbsp;
        </TableColumn>
        <TableColumn key="name">Name</TableColumn>
        <TableColumn key="size">Size</TableColumn>
        <TableColumn key="resolution">Resolution</TableColumn>
        <TableColumn key="saved">Saved</TableColumn>
        <TableColumn key="info">Info</TableColumn>
      </TableHeader>
      <TableBody items={fileList}>
        {(cImage) => (
          <TableRow key={cImage.id}>
            <TableCell>
              <div className="flex items-center justify-center">
                <Circle className="text-primary size-4"></Circle>
              </div>
            </TableCell>
            <TableCell>{cImage.name}</TableCell>
            <TableCell>{prettyBytes(cImage.size)}</TableCell>
            <TableCell>
              {cImage.width}x{cImage.height}
            </TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default FileListTable;
