import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClosed?.();
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div>{message}</div>
        <DialogFooter>{buttons}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AskDialog;
