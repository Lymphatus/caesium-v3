import { useTranslation } from 'react-i18next';
import useSettingsStore from '@/stores/settings.store.ts';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

function ImportSettings() {
  const { t } = useTranslation();
  const { importSubfolderOnInput, setImportSubfolderOnInput } = useSettingsStore();

  return (
    <div className="h-full">
      <div className="flex size-full flex-col gap-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col">
            <Label htmlFor="switch-import-subfolder-on-input">{t('settings.scan_subfolders_on_import')}</Label>
            <span className="text-default-500 text-sm">{t('settings.scan_subfolders_on_import_help')}</span>
          </div>
          <Switch
            checked={importSubfolderOnInput}
            id="switch-import-subfolder-on-input"
            onCheckedChange={setImportSubfolderOnInput}
          ></Switch>
        </div>
      </div>
    </div>
  );
}

export default ImportSettings;
