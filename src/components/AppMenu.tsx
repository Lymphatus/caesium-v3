import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import useUIStore from '@/stores/ui.store.ts';
import useFileListStore from '@/stores/file-list.store.ts';
import { Heart, Import, Info, RefreshCcw } from 'lucide-react';

function AppMenu() {
  const { t } = useTranslation();
  const {
    showPreviewPanel,
    autoPreview,
    showLabelsInToolbar,
    setShowPreviewPanel,
    setAutoPreview,
    setShowLabelsInToolbar,
    setAboutDialogOpen,
    setCheckForUpdatesDialogOpen,
    setAdvancedImportDialogOpen,
  } = useUIStore();
  const { isCompressing } = useFileListStore();

  return (
    <DropdownMenuContent>
      <DropdownMenuItem disabled={isCompressing} onSelect={() => setAdvancedImportDialogOpen(true)}>
        <Import className="size-4" />
        {t('actions.advanced_import')}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuCheckboxItem
        checked={showPreviewPanel}
        onCheckedChange={setShowPreviewPanel}
        onSelect={(e) => e.preventDefault()}
      >
        {t('actions.show_previews')}
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={autoPreview}
        onCheckedChange={setAutoPreview}
        onSelect={(e) => e.preventDefault()}
      >
        {t('actions.auto_preview')}
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={showLabelsInToolbar}
        onCheckedChange={setShowLabelsInToolbar}
        onSelect={(e) => e.preventDefault()}
      >
        {t('actions.show_toolbar_labels')}
      </DropdownMenuCheckboxItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <a href="https://saerasoft.com/caesium/donate" rel="noopener noreferrer" target="_blank">
          <Heart className="size-4 text-pink-500" />
          {t('actions.donate')}
        </a>
      </DropdownMenuItem>
      <DropdownMenuItem disabled={isCompressing} onSelect={() => setCheckForUpdatesDialogOpen(true)}>
        <RefreshCcw className="size-4" />
        {t('actions.check_for_updates')}
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => setAboutDialogOpen(true)}>
        <Info className="size-4" />
        {t('actions.about')}
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

export default AppMenu;
