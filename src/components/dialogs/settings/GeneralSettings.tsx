import { Link, Select, SelectItem } from '@heroui/react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { THEME } from '@/types.ts';
import { useTranslation } from 'react-i18next';
import useSettingsStore from '@/stores/settings.store.ts';
import UsageStatsDialog from '@/components/dialogs/UsageStatsDialog.tsx';
import { useState } from 'react';
import i18n from 'i18next';
import { showNotification } from '@/utils/notification-manager.ts';
import { isInDevelopmentMode } from '@/utils/utils.ts';

function GeneralSettings() {
  const { t } = useTranslation();
  const {
    theme,
    promptBeforeExit,
    language,
    checkUpdatesAtStartup,
    skipMessagesAndDialogs,
    sendUsageData,
    allowNotifications,
    setTheme,
    setPromptBeforeExit,
    setLanguage,
    setCheckUpdatesAtStartup,
    setSkipMessagesAndDialogs,
    setSendUsageData,
    setAllowNotifications,
  } = useSettingsStore();
  const themes = [
    { key: THEME.SYSTEM, label: t('settings.theme_system') },
    { key: THEME.LIGHT, label: t('settings.theme_light') },
    { key: THEME.DARK, label: t('settings.theme_dark') },
  ];
  const languages = [
    { key: 'en-US', label: 'English (United States)' },
    { key: 'it-IT', label: 'Italiano' },
  ];

  const [usageStatsDialogOpen, setUsageStatsDialogOpen] = useState(false);
  return (
    <>
      <div className="h-full">
        <div className="flex size-full flex-col gap-4">
          <Select
            disallowEmptySelection
            aria-label={t('settings.theme')}
            classNames={{
              base: 'justify-between',
              mainWrapper: 'max-w-[250px]',
              label: 'text-md',
              trigger: 'shadow-none',
              popoverContent: 'bg-content2 border-2 border-content1',
            }}
            label={t('settings.theme')}
            labelPlacement="outside-left"
            selectedKeys={[theme]}
            selectionMode="single"
            size="sm"
            variant="faded"
            onSelectionChange={(value) => setTheme((value.currentKey as THEME) || THEME.SYSTEM)}
          >
            {themes.map((t) => (
              <SelectItem key={t.key}>{t.label}</SelectItem>
            ))}
          </Select>
          <Select
            disallowEmptySelection
            aria-label={t('settings.language')}
            classNames={{
              base: 'justify-between',
              mainWrapper: 'max-w-[250px]',
              label: 'text-md',
              trigger: 'shadow-none',
              popoverContent: 'bg-content2 border-2 border-content1',
            }}
            label={t('settings.language')}
            labelPlacement="outside-left"
            selectedKeys={[language]}
            selectionMode="single"
            size="sm"
            variant="faded"
            onSelectionChange={async (value) => {
              await i18n.changeLanguage(value.currentKey as string, () => {
                setLanguage((value.currentKey as string) || 'en-US');
              });
            }}
          >
            {languages.map((t) => (
              <SelectItem key={t.key}>{t.label}</SelectItem>
            ))}
          </Select>
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col">
              <Label htmlFor="switch-prompt-before-exit">{t('settings.prompt_on_exit')}</Label>
            </div>
            <Switch
              checked={promptBeforeExit}
              id="switch-prompt-before-exit"
              onCheckedChange={setPromptBeforeExit}
            ></Switch>
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col">
              <Label htmlFor="switch-check-updates-at-startup">{t('settings.auto_check_updates')}</Label>
            </div>
            <Switch
              checked={checkUpdatesAtStartup}
              id="switch-check-updates-at-startup"
              onCheckedChange={setCheckUpdatesAtStartup}
            ></Switch>
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col">
              <Label htmlFor="switch-skip-messages-and-dialogs">{t('settings.skip_dialogs')}</Label>
              <span className="text-default-500 text-sm">{t('settings.skip_dialogs_help')}</span>
            </div>
            <Switch
              checked={skipMessagesAndDialogs}
              id="switch-skip-messages-and-dialogs"
              onCheckedChange={setSkipMessagesAndDialogs}
            ></Switch>
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col">
              <Label htmlFor="switch-allow-notifications">{t('settings.allow_notifications')}</Label>
              {isInDevelopmentMode() && (
                <Link
                  className="text-primary cursor-pointer text-sm"
                  underline="hover"
                  onPress={() => showNotification({ title: 'Test notification' })}
                >
                  Send test notification
                </Link>
              )}
            </div>
            <Switch
              checked={allowNotifications}
              id="switch-allow-notifications"
              onCheckedChange={setAllowNotifications}
            ></Switch>
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col">
              <Label htmlFor="switch-send-usage-data">{t('settings.send_usage_statistics')}</Label>
              <Link
                className="text-primary cursor-pointer text-sm"
                underline="hover"
                onPress={() => setUsageStatsDialogOpen(true)}
              >
                {t('settings.send_usage_statistics_help')}
              </Link>
            </div>
            <Switch checked={sendUsageData} id="switch-send-usage-data" onCheckedChange={setSendUsageData}></Switch>
          </div>
        </div>
      </div>
      <UsageStatsDialog isOpen={usageStatsDialogOpen} onClose={() => setUsageStatsDialogOpen(false)}></UsageStatsDialog>
    </>
  );
}

export default GeneralSettings;
