import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
          <div className="flex w-full items-center justify-between">
            <Label>{t('settings.theme')}</Label>
            <Select value={theme} onValueChange={(value) => setTheme(value as THEME)}>
              <SelectTrigger aria-label={t('settings.theme')} className="max-w-[250px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themes.map((t) => (
                  <SelectItem key={t.key} value={t.key}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full items-center justify-between">
            <Label>{t('settings.language')}</Label>
            <Select
              value={language}
              onValueChange={async (value) => {
                await i18n.changeLanguage(value, () => {
                  setLanguage(value || 'en-US');
                });
              }}
            >
              <SelectTrigger aria-label={t('settings.language')} className="max-w-[250px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((t) => (
                  <SelectItem key={t.key} value={t.key}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                <Button
                  className="h-auto justify-start p-0 text-sm"
                  variant="link"
                  onClick={() => showNotification({ title: 'Test notification' })}
                >
                  Send test notification
                </Button>
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
              <Button
                className="h-auto justify-start p-0 text-sm"
                variant="link"
                onClick={() => setUsageStatsDialogOpen(true)}
              >
                {t('settings.send_usage_statistics_help')}
              </Button>
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
