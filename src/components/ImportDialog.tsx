import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress.tsx';

interface ImportDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  hideCloseButton?: boolean;
  importProgress?: number;
}

function ImportDialog({ isOpen, onOpenChange, hideCloseButton, importProgress }: ImportDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent hideCloseButton={hideCloseButton}>
        <DialogHeader>
          {/*TODO translate*/}
          <DialogTitle>Importing...</DialogTitle>
          <DialogDescription>
            <Progress value={importProgress || 0} className="w-full"></Progress>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default ImportDialog;
