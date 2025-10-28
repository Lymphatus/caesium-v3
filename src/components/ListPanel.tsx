import FileListTable from '@/components/file-list/FileListTable.tsx';
import FileListPagination from '@/components/file-list/FileListPagination.tsx';
import { Play, Plus } from 'lucide-react';
import { Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import useFileListStore from '@/stores/file-list.store.ts';

function ListPanel() {
  const { t } = useTranslation();
  const { invokeCompress, fileList, openPickerDialogs, isCompressing } = useFileListStore();

  return (
    <div className="size-full">
      <div className="bg-content1 flex size-full flex-col rounded">
        <FileListTable></FileListTable>
        <div className="bg-content2 flex min-h-[40px] items-center justify-between rounded-b p-2">
          <div className="flex flex-1 justify-start">
            <Button
              disableRipple
              isIconOnly
              isDisabled={isCompressing}
              size="sm"
              startContent={<Plus className="size-4"></Plus>}
              title={t('actions.add_dots')}
              variant="solid"
              onPress={() => openPickerDialogs('files')}
            ></Button>
          </div>
          <div className="flex flex-1 justify-center">
            <FileListPagination></FileListPagination>
          </div>
          <div className="flex flex-1 justify-end">
            <Button
              disableRipple
              color="primary"
              isDisabled={fileList.length === 0 || isCompressing}
              size="sm"
              startContent={<Play className="size-4"></Play>}
              title={t('actions.compress')}
              variant="solid"
              onPress={() => invokeCompress()}
            >
              {t('actions.compress')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListPanel;
