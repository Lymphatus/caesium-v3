import { Modal, ModalBody, ModalContent, Progress } from '@heroui/react';
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
          <Progress
            disableAnimation
            showValueLabel
            className="w-full"
            isIndeterminate={!importProgress}
            label={importProgress ? t('importing_dots') : t('collecting_dots')}
            size="sm"
            value={importProgress || 0}
          ></Progress>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default ImportDialog;
