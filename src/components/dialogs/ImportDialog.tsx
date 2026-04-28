import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import useFileListStore from '@/stores/file-list.store.ts';
import { VisuallyHidden } from 'radix-ui';
import { useTranslation } from 'react-i18next';

function ImportDialog() {
  const { isImporting, importProgress } = useFileListStore();
  const { t } = useTranslation();

  return (
    <Dialog open={isImporting}>
      <DialogContent
        className="sm:max-w-sm"
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <VisuallyHidden.Root>
          <DialogHeader>
            <DialogTitle>{t('importing_dots')}</DialogTitle>
          </DialogHeader>
        </VisuallyHidden.Root>

        <DialogBody className="flex w-full flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span>{importProgress ? t('importing_dots') : t('collecting_dots')}</span>
            {!!importProgress && <span>{Math.round(importProgress)}%</span>}
          </div>
          <Progress disableAnimations value={importProgress || undefined} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

export default ImportDialog;
