import FileListTable from '@/components/file-list/FileListTable.tsx';
import FileListPagination from '@/components/file-list/FileListPagination.tsx';
import { Search, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useFileListStore from '@/stores/file-list.store.ts';
import usePreviewStore from '@/stores/preview.store';
import { Button } from '../ui/button';
import { invokeBackend } from '@/utils/invoker';
import { FileListPayload } from '@/types';

function ListPanel() {
  const { t } = useTranslation();
  const { invokePreview } = usePreviewStore();
  const { selectedItems, isCompressing, updateList, setIsListLoading, fileList } = useFileListStore();
  const onRemoveItemFromListPressed = async () => {
    setIsListLoading(true);
    invokeBackend<FileListPayload>('remove_items_from_list', { keys: selectedItems.map((c) => c.id) })
      .then((payload) => updateList(payload))
      .finally(() => setIsListLoading(false));
  };

  const onClearPressed = async () =>
    invokeBackend<FileListPayload>('clear_list').then((payload: FileListPayload) => updateList(payload));

  return (
    <div className="size-full">
      <div className="bg-card flex size-full flex-col rounded">
        <FileListTable></FileListTable>
        <div className="bg-muted flex min-h-10 items-center justify-between rounded-b p-2">
          <div className="flex flex-1 justify-start gap-2">
            <Button
              disabled={selectedItems.length === 0 || isCompressing}
              size="sm"
              title={t('actions.remove')}
              variant="destructive"
              onClick={onRemoveItemFromListPressed}
            >
              <X></X>
              <span>{t('actions.remove')}</span>
            </Button>
            <Button
              disabled={fileList.length === 0 || isCompressing}
              size="sm"
              title={t('actions.clear')}
              variant="destructive"
              onClick={onClearPressed}
            >
              <Trash2></Trash2>
              <span>{t('actions.clear')}</span>
            </Button>
          </div>
          <div className="flex flex-1 justify-center">
            <FileListPagination></FileListPagination>
          </div>
          <div className="flex flex-1 justify-end">
            <Button
              disabled={selectedItems.length === 0 || isCompressing}
              size="sm"
              variant="outline"
              onClick={() => invokePreview(selectedItems.map((c) => c.id))}
            >
              <Search></Search>
              <span>{t('actions.preview')}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListPanel;
