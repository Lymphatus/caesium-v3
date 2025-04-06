import { Switch } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import useSettingsStore from '@/stores/settings.store.ts';

function ImportSettings() {
  const { t } = useTranslation();
  const { importSubfolderOnInput, setImportSubfolderOnInput } = useSettingsStore();

  return (
    <div className="h-full">
      <div className="flex size-full flex-col gap-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col">
            <span>{t('settings.scan_subfolders_on_import')}</span>
            <small className="text-default-500">{t('settings.scan_subfolders_on_import_help')}</small>
          </div>
          <Switch isSelected={importSubfolderOnInput} size="sm" onValueChange={setImportSubfolderOnInput}></Switch>
        </div>
      </div>
    </div>
  );
}

export default ImportSettings;
