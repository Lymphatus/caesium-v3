import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import useFileListStore from '@/stores/file-list.store.ts';
import { Circle } from 'lucide-react';
import prettyBytes from 'pretty-bytes';
import usePreviewStore from '@/stores/preview.store.ts';
import { useTranslation } from 'react-i18next';

function FileListTable() {
  const { fileList } = useFileListStore();
  const { setCurrentPreviewedCImage } = usePreviewStore();
  const { t } = useTranslation();

  return (
    <Table
      fullWidth
      isHeaderSticky
      removeWrapper
      aria-label="File list"
      checkboxesProps={{ disableAnimation: true, size: 'sm' }}
      classNames={{
        base: 'h-full justify-between overflow-auto',
        th: 'h-8 first:rounded-b-none first:rounded-t-sm last:rounded-b-none last:rounded-t-sm',
      }}
      radius="sm"
      selectionMode="multiple"
      shadow="none"
      onRowAction={(key) => setCurrentPreviewedCImage(fileList.find((cImage) => cImage.id === key) || null)}
    >
      <TableHeader className="rounded-sm">
        {/*TODO Translations*/}
        <TableColumn key="status" align="center" minWidth={100}>
          {t('file_list.status')}
        </TableColumn>
        <TableColumn key="name">{t('file_list.filename')}</TableColumn>
        <TableColumn key="size">{t('file_list.size')}</TableColumn>
        <TableColumn key="resolution">{t('file_list.resolution')}</TableColumn>
        <TableColumn key="saved">{t('file_list.saved')}</TableColumn>
        <TableColumn key="info">{t('file_list.additional_info')}</TableColumn>
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
