import { Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import useFileListStore from '@/stores/file-list.store.ts';
import { Circle } from 'lucide-react';
import prettyBytes from 'pretty-bytes';
import usePreviewStore from '@/stores/preview.store.ts';
import { useTranslation } from 'react-i18next';
import { sep } from '@tauri-apps/api/path';
import { Selection } from '@react-types/shared';

function getSubpart(baseFolder: string | null, fullPath: string, filename: string) {
  if (!baseFolder) {
    return '';
  }
  const separator = sep();
  return fullPath.replace(baseFolder, '').replace(filename, '').replace(separator, '');
}

function FileListTable() {
  const { fileList, isListLoading, baseFolder, setSelectedItems, selectedItems } = useFileListStore();
  const { setCurrentPreviewedCImage } = usePreviewStore();
  const { t } = useTranslation();

  const handleSelectionChange = function (keys: Selection) {
    const selectedItems = fileList.filter((item) => (keys === 'all' ? true : keys.has(item.id)));
    setSelectedItems(selectedItems);
    // if (selectedItems.length === 0) {
    //   setCurrentPreviewedCImage(selectedItems[0]);
    // }
  };

  return (
    <Table
      fullWidth
      isHeaderSticky
      removeWrapper
      aria-label="File list"
      checkboxesProps={{ disableAnimation: true, size: 'sm', className: 'p-0 pb-1' }}
      classNames={{
        base: 'h-full justify-between overflow-auto',
        th: 'h-8 first:rounded-b-none first:rounded-t-sm last:rounded-b-none last:rounded-t-sm [&:first-child]:w-[32px]',
      }}
      layout="auto"
      radius="sm"
      selectedKeys={selectedItems.map((item) => item.id)}
      selectionMode="multiple"
      shadow="none"
      onRowAction={(key) => setCurrentPreviewedCImage(fileList.find((cImage) => cImage.id === key) || null)}
      onSelectionChange={handleSelectionChange}
    >
      <TableHeader className="rounded-sm">
        <TableColumn key="status" align="center" width={40}>
          &nbsp;
        </TableColumn>
        <TableColumn key="name">{t('file_list.filename')}</TableColumn>
        <TableColumn key="size">{t('file_list.size')}</TableColumn>
        <TableColumn key="resolution">{t('file_list.resolution')}</TableColumn>
        <TableColumn key="saved">{t('file_list.saved')}</TableColumn>
        <TableColumn key="info">{t('file_list.additional_info')}</TableColumn>
      </TableHeader>
      <TableBody
        isLoading={isListLoading}
        items={fileList}
        loadingContent={
          <div className="bg-background/50 z-10 flex size-full items-center justify-center">
            <Spinner />
          </div>
        }
      >
        {(cImage) => (
          <TableRow key={cImage.id}>
            <TableCell>
              <div className="flex items-center justify-center">
                <Circle className="text-primary size-4"></Circle>
              </div>
            </TableCell>
            <TableCell>
              <small className="text-default-400">{getSubpart(baseFolder, cImage.path, cImage.name)}</small>
              <span>{cImage.name}</span>
            </TableCell>
            <TableCell>{prettyBytes(cImage.size)}</TableCell>
            <TableCell>
              <span>
                {cImage.width}x{cImage.height}
              </span>
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
