import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { ReactNode } from 'react';

type AskDialogProps = {
  title?: string;
  message?: string;
  buttons?: ReactNode;
  isOpen: boolean;
  onClosed?: () => void;
};

function AskDialog({ title, message, buttons, isOpen, onClosed }: AskDialogProps) {
  return (
    <Modal
      isDismissable
      backdrop="blur"
      classNames={{
        backdrop: 'bg-content3/50',
      }}
      isOpen={isOpen}
      shadow="none"
      size="sm"
      onClose={onClosed}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
        <ModalBody>{message}</ModalBody>
        <ModalFooter>{buttons}</ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default AskDialog;
