import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import useUIStore from '@/stores/ui.store';
import appLogo from '@/assets/images/app-icon.png';
import { app } from '@tauri-apps/api';
import useAppStore from '@/stores/app.store.ts';
import { openPath } from '@tauri-apps/plugin-opener';
import { appLogDir } from '@tauri-apps/api/path';
import { Button } from '../ui/button';

const appVersion = await app.getVersion();

function AboutDialog() {
  const { aboutDialogOpen, setAboutDialogOpen } = useUIStore();
  const { uuid } = useAppStore();
  const { t } = useTranslation();

  return (
    <Dialog
      open={aboutDialogOpen}
      onOpenChange={(open) => {
        if (!open) setAboutDialogOpen(false);
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="sr-only">{t('app_name')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <img alt="Caesium Logo" className="mx-auto mb-4 w-32" src={appLogo} />
          <div className="flex flex-col items-center justify-center">
            <div className="text-xl font-bold">{t('app_name')}</div>
            <span className="text-sm">v{appVersion}</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-1">
            <small className="font-mono text-xs">UUID: {uuid}</small>
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                const logDir = await appLogDir();
                await openPath(logDir);
              }}
            >
              {t('open_log_folder')}
            </Button>
            <a
              className="text-primary text-sm hover:underline"
              href="https://saerasoft.com/caesium"
              rel="noreferrer"
              target="_blank"
            >
              saerasoft.com/caesium
            </a>
          </div>
        </div>
        <DialogFooter>
          <div className="w-full text-center">
            <small className="text-xs">{t('copyright_note')}</small>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AboutDialog;
