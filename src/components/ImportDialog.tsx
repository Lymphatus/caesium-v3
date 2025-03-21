import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Progress } from '@heroui/react';
import useFileListStore from '@/stores/file-list.store.ts';

function ImportDialog() {
  const { isImporting, importProgress } = useFileListStore();

  return (
    <Modal
      isOpen={isImporting}
      hideCloseButton
      backdrop="blur"
      // shadow="none"
      isDismissable={false}
      isKeyboardDismissDisabled
      size="sm"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Importing...</ModalHeader>
        <ModalBody>
          <Progress
            size="sm"
            isIndeterminate={!importProgress}
            value={importProgress || 0}
            className="w-full"
            aria-label="Progress..."
          ></Progress>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ImportDialog;
