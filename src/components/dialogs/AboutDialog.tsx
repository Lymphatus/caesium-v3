import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import useUIStore from '@/stores/ui.store';
import appLogo from '@/assets/images/app-icon.png';
import { app, path } from '@tauri-apps/api';
import { load } from '@tauri-apps/plugin-store';
import { AppPreferences } from '@/types.ts';
import { invoke } from '@tauri-apps/api/core';

const appVersion = await app.getVersion();
const exeDir = await invoke<string>('get_executable_dir');
const settings = await load(await path.join(exeDir, 'settings.json'), { autoSave: false });
const preferences = (await settings.get('app')) as AppPreferences;

function AboutDialog() {
  const { aboutDialogOpen, setAboutDialogOpen } = useUIStore();
  const { t } = useTranslation();

  return (
    <Modal
      backdrop="blur"
      classNames={{
        backdrop: 'bg-content3/50',
      }}
      isOpen={aboutDialogOpen}
      shadow="none"
      size="sm"
      onClose={() => setAboutDialogOpen(false)}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1"></ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <img alt="Caesium Logo" className="mx-auto mb-4 w-32" src={appLogo} />
            <div className="flex flex-col items-center justify-center">
              <div className="text-xl font-bold">{t('app_name')}</div>
              <span className="text-sm">v{appVersion}</span>
            </div>

            <Button
              disableRipple
              color="primary"
              size="sm"
              onPress={() => console.log('Check for updates')}
              // variant="flat"
            >
              {t('check_for_updates')}
            </Button>
            <div className="flex flex-col items-center justify-center">
              <small className="font-mono text-xs">UUID: {preferences.uuid}</small>
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
        </ModalBody>

        <ModalFooter>
          <div className="w-full text-center">
            <small className="text-xs">{t('copyright_note')}</small>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default AboutDialog;
