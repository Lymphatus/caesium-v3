import { Delete, FolderPlus, ImagePlus, Play, Search, Settings, Trash2 } from 'lucide-react';
import useFileListStore from '@/stores/file-list.store.ts';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';

function Toolbar() {
  const { openPickerDialogs } = useFileListStore();
  const { t } = useTranslation();

  return (
    <div className="bg-content1 flex h-[40px] w-full items-center justify-between px-2">
      <div className="flex h-full items-center gap-1">
        <Button
          disableRipple
          isIconOnly
          size="sm"
          title={t('actions.add_dots')}
          variant="light"
          onPress={() => openPickerDialogs('files')}
        >
          <ImagePlus className="size-5"></ImagePlus>
        </Button>
        <Button
          disableRipple
          isIconOnly
          size="sm"
          title={t('actions.add_folder_dots')}
          variant="light"
          onPress={() => openPickerDialogs('folder')}
        >
          <FolderPlus className="size-5"></FolderPlus>
        </Button>
        <Button disableRipple isIconOnly color="danger" size="sm" title={t('actions.remove')} variant="light">
          <Delete className="size-5"></Delete>
        </Button>
        <Button
          disableRipple
          isIconOnly
          color="danger"
          size="sm"
          title={t('actions.clear')}
          variant="light"
          onPress={async () => await invoke('clear_list')}
        >
          <Trash2 className="size-5"></Trash2>
        </Button>
        <Button disableRipple isIconOnly size="sm" title={t('actions.preview')} variant="light">
          <Search className="size-5"></Search>
        </Button>
        <Button disableRipple isIconOnly color="primary" size="sm" title={t('actions.compress')} variant="light">
          <Play className="size-5"></Play>
        </Button>
      </div>
      <div className="flex h-full items-center gap-1">
        <Button disableRipple isIconOnly size="sm" title={t('actions.settings')} variant="light">
          <Settings className="size-5"></Settings>
        </Button>
      </div>
    </div>
  );
}

export default Toolbar;
