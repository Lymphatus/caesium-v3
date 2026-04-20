import { Ellipsis, FolderPlus, ImagePlus, Play, Settings } from 'lucide-react';
import useFileListStore from '@/stores/file-list.store.ts';
import { useTranslation } from 'react-i18next';
import useUIStore from '@/stores/ui.store.ts';
import { Divider, Dropdown, DropdownTrigger } from '@heroui/react';
import AppMenu from '@/components/AppMenu.tsx';
import FileListFilter from '@/components/file-list/FileListFilter.tsx';
import { Button } from './ui/button';

function Toolbar() {
  const { openPickerDialogs, fileList, invokeCompress, isCompressing } = useFileListStore();
  const { setSettingsDialogOpen, showLabelsInToolbar } = useUIStore();
  const { t } = useTranslation();

  return (
    <div className="bg-content1 flex h-[40px] w-full items-center justify-between px-2">
      <div className="flex h-full items-center gap-2">
        <Button
          disabled={isCompressing}
          size="sm"
          title={t('actions.add_dots')}
          variant="ghost"
          onClick={() => openPickerDialogs('files')}
        >
          <ImagePlus></ImagePlus>
          {showLabelsInToolbar && <span>{t('actions.add_dots')}</span>}
        </Button>
        <Button
          disabled={isCompressing}
          size="sm"
          title={t('actions.add_folder_dots')}
          variant="ghost"
          onClick={() => openPickerDialogs('folder')}
        >
          <FolderPlus></FolderPlus>
          {showLabelsInToolbar && <span>{t('actions.add_folder_dots')}</span>}
        </Button>
      </div>
      <div className="flex h-full items-center gap-2">
        <FileListFilter></FileListFilter>
      </div>
      <div className="flex h-full items-center gap-2">
        <Button
          disabled={fileList.length === 0 || isCompressing}
          size="sm"
          title={t('actions.compress')}
          onClick={() => invokeCompress()}
        >
          <Play></Play>
          {showLabelsInToolbar && <span>{t('actions.compress')}</span>}
        </Button>
        <div className="h-full py-2">
          <Divider orientation="vertical"></Divider>
        </div>
        <Button size="sm" title={t('actions.settings')} variant="ghost" onClick={() => setSettingsDialogOpen(true)}>
          <Settings></Settings>
          {showLabelsInToolbar && <span>{t('actions.settings')}</span>}
        </Button>
        <Dropdown
          classNames={{
            content: 'bg-default-50',
          }}
        >
          <DropdownTrigger>
            <Button size="icon-sm" title={t('actions.menu')} variant="ghost" onClick={() => {}}>
              <Ellipsis></Ellipsis>
            </Button>
          </DropdownTrigger>
          <AppMenu></AppMenu>
        </Dropdown>
      </div>
    </div>
  );
}

export default Toolbar;
