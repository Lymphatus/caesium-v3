import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ImportDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

function ImportDialog({ isOpen, onOpenChange }: ImportDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          {/*TODO translate*/}
          <DialogTitle>Importing...</DialogTitle>
          <DialogDescription>Importing...</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default ImportDialog;
