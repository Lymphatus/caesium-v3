import { Delete, FolderPlus, ImagePlus, Play, Search, Settings, Trash2 } from 'lucide-react';
import useFileListStore from '@/stores/file-list.store.ts';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '@heroui/react';

function Toolbar() {
  const { openPickerDialogs } = useFileListStore();

  return (
    <div className="w-full h-[36px] flex items-center justify-between bg-content1 px-2">
      <div className="h-full flex items-center gap-1 h-full">
        <Button isIconOnly disableRipple variant="light" size="sm" onPress={() => openPickerDialogs('files')}>
          <ImagePlus className="size-4"></ImagePlus>
        </Button>
        <Button isIconOnly disableRipple variant="light" size="sm" onPress={() => openPickerDialogs('folder')}>
          <FolderPlus className="size-4"></FolderPlus>
        </Button>
        <Button isIconOnly disableRipple variant="light" size="sm" color="danger">
          <Delete className="size-4"></Delete>
        </Button>
        <Button
          isIconOnly
          disableRipple
          variant="light"
          color="danger"
          size="sm"
          onPress={async () => await invoke('clear_list')}
        >
          <Trash2 className="size-4"></Trash2>
        </Button>
        <Button isIconOnly disableRipple variant="light" size="sm">
          <Search className="size-4"></Search>
        </Button>
        <Button isIconOnly disableRipple variant="light" size="sm" color="primary">
          <Play className="size-4"></Play>
        </Button>
      </div>
      <div className="h-full flex items-center gap-1">
        <Button isIconOnly disableRipple variant="light" size="sm">
          <Settings className="size-4"></Settings>
        </Button>
      </div>
    </div>
  );
}

export default Toolbar;
