import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import useFileListStore from '@/stores/file-list.store.ts';
import { CImage } from '@/types.ts';
import React from 'react';

interface FileListItemProps {
  cImage: CImage;
}

function FileListTable() {
  const { fileList, baseFolder } = useFileListStore();
  const listItems = fileList.map((cImage) => <FileListItem key={cImage.id} cImage={cImage} />);

  return (
    <Table className="size-full">
      <TableCaption className="sticky bottom-0 bg-background">{baseFolder}</TableCaption>
      <TableHeader className="sticky top-0 bg-background">
        <TableRow>
          <TableHead></TableHead>
          <TableHead>Name</TableHead>
          {/* TODO Translations */}
          <TableHead>Size</TableHead>
          {/* TODO Translations */}
          <TableHead>Resolution</TableHead>
          {/* TODO Translations */}
          <TableHead>Saved</TableHead>
          {/* TODO Translations */}
          <TableHead>Info</TableHead>
          {/* TODO Translations */}
        </TableRow>
      </TableHeader>
      <TableBody>{listItems}</TableBody>
    </Table>
  );
}

const FileListItem: React.FC<FileListItemProps> = ({ cImage }) => {
  return (
    <TableRow>
      <TableCell className="text-left"></TableCell>
      <TableCell className="text-left">{cImage.name}</TableCell>
      <TableCell className="text-left">{cImage.size}</TableCell>
      <TableCell className="text-left">
        {cImage.width}x{cImage.height}
      </TableCell>
      <TableCell className="text-left">-</TableCell>
      <TableCell className="text-left">-</TableCell>
    </TableRow>
  );
};

export default FileListTable;
