import { Ellipsis, FolderPlus, ImagePlus, Play, Settings } from 'lucide-react';
import useFileListStore from '@/stores/file-list.store.ts';
import { useTranslation } from 'react-i18next';
import useUIStore from '@/stores/ui.store.ts';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import AppMenu from '@/components/AppMenu.tsx';
import FileListFilter from '@/components/file-list/FileListFilter.tsx';
import { Button } from './ui/button';

function Toolbar() {
  const { openPickerDialogs, fileList, invokeCompress, isCompressing } = useFileListStore();
  const { setSettingsDialogOpen, showLabelsInToolbar } = useUIStore();
  const { t } = useTranslation();

  return (
    <div className="flex h-[40px] w-full items-center justify-between p-2">
      <div className="flex h-full items-center gap-2">
        <Button
          disabled={isCompressing}
          size={showLabelsInToolbar ? 'sm' : 'icon-sm'}
          title={t('actions.add_dots')}
          variant="ghost"
          onClick={() => openPickerDialogs('files')}
        >
          <ImagePlus></ImagePlus>
          {showLabelsInToolbar && <span>{t('actions.add_dots')}</span>}
        </Button>
        <Button
          disabled={isCompressing}
          size={showLabelsInToolbar ? 'sm' : 'icon-sm'}
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
          size={showLabelsInToolbar ? 'sm' : 'icon-sm'}
          title={t('actions.compress')}
          onClick={() => invokeCompress()}
        >
          <Play></Play>
          {showLabelsInToolbar && <span>{t('actions.compress')}</span>}
        </Button>
        <Separator orientation="vertical" />
        <Button
          size={showLabelsInToolbar ? 'sm' : 'icon-sm'}
          title={t('actions.settings')}
          variant="ghost"
          onClick={() => setSettingsDialogOpen(true)}
        >
          <Settings></Settings>
          {showLabelsInToolbar && <span>{t('actions.settings')}</span>}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-sm" title={t('actions.menu')} variant="ghost">
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <AppMenu />
        </DropdownMenu>
      </div>
    </div>
  );
}

export default Toolbar;
