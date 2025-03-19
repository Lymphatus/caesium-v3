import { Button } from '@/components/ui/button.tsx';
import { Archive, Delete, FolderPlus, ImagePlus, Search, Settings, Trash2 } from 'lucide-react';
import useFileListStore from '@/stores/file-list.store.ts';
import { invoke } from '@tauri-apps/api/core';

function Toolbar() {
  const { openPickerDialogs } = useFileListStore();

  return (
    <div className="w-full h-[40px] flex items-center justify-between pt-1">
      <div className="h-full flex items-center gap-1">
        <Button variant="ghost" onClick={() => openPickerDialogs('files')}>
          <ImagePlus className="size-5"></ImagePlus>
        </Button>
        <Button variant="ghost" onClick={() => openPickerDialogs('folder')}>
          <FolderPlus className="size-5"></FolderPlus>
        </Button>
        <Button variant="ghost">
          <Delete className="size-5"></Delete>
        </Button>
        <Button variant="ghost" onClick={async () => await invoke('clear_list')}>
          <Trash2 className="size-5"></Trash2>
        </Button>
        <Button variant="ghost">
          <Search className="size-5"></Search>
        </Button>
        <Button variant="ghost">
          <Archive className="size-5"></Archive>
        </Button>
      </div>
      <div className="h-full flex items-center gap-1">
        <Button variant="ghost">
          <Settings className="size-5"></Settings>
        </Button>
      </div>
    </div>
  );
}

export default Toolbar;
