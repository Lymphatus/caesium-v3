import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useUIStore from '@/stores/ui.store.ts';
import { useTranslation } from 'react-i18next';
import { Code, Import, Settings2 } from 'lucide-react';
import GeneralSettings from '@/components/dialogs/settings/GeneralSettings.tsx';
import ImportSettings from '@/components/dialogs/settings/ImportSettings.tsx';
import AdvancedSettings from '@/components/dialogs/settings/AdvancedSettings.tsx';
import { Button } from '@/components/ui/button';

function SettingsDialog() {
  const { setSettingsDialogOpen, settingsDialogOpen } = useUIStore();
  const { t } = useTranslation();

  return (
    <Modal
      backdrop="blur"
      className="min-h-[50%] rounded-sm shadow-none"
      classNames={{
        backdrop: 'bg-content3/50',
      }}
      isOpen={settingsDialogOpen}
      shadow="none"
      size="3xl"
      onClose={() => setSettingsDialogOpen(false)}
      onOpenChange={() => {}}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{t('settings_title')}</ModalHeader>
        <ModalBody>
          <Tabs className="flex flex-row gap-4" defaultValue="general" orientation="vertical">
            <TabsList className="flex h-auto flex-col">
              <TabsTrigger className="w-full justify-start" value="general">
                <Settings2 />
                <span>{t('settings.general')}</span>
              </TabsTrigger>
              <TabsTrigger className="w-full justify-start" value="import">
                <Import />
                <span>{t('settings.import')}</span>
              </TabsTrigger>
              <TabsTrigger className="w-full justify-start" value="advanced">
                <Code />
                <span>{t('settings.advanced')}</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent className="flex-1" value="general">
              <GeneralSettings />
            </TabsContent>
            <TabsContent className="flex-1" value="import">
              <ImportSettings />
            </TabsContent>
            <TabsContent className="flex-1" value="advanced">
              <AdvancedSettings />
            </TabsContent>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setSettingsDialogOpen(false)}>
            {t('close')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default SettingsDialog;
