import { Modal, ModalBody, ModalContent } from '@heroui/react';
import { Progress } from '@/components/ui/progress';
import useFileListStore from '@/stores/file-list.store.ts';
import { useTranslation } from 'react-i18next';

function ImportDialog() {
  const { isImporting, importProgress } = useFileListStore();
  const { t } = useTranslation();

  return (
    <Modal
      hideCloseButton
      isKeyboardDismissDisabled
      backdrop="blur"
      classNames={{
        backdrop: 'bg-content3/50',
      }}
      isDismissable={false}
      isOpen={isImporting}
      shadow="none"
      size="sm"
    >
      <ModalContent>
        <ModalBody className="py-8">
          <div className="flex w-full flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span>{importProgress ? t('importing_dots') : t('collecting_dots')}</span>
              {!!importProgress && <span>{Math.round(importProgress)}%</span>}
            </div>
            <Progress value={importProgress || undefined} />
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default ImportDialog;
