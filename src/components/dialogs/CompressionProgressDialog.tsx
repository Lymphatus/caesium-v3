import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import useFileListStore from '@/stores/file-list.store.ts';
import { useTranslation } from 'react-i18next';
import { Pause, Play, X } from 'lucide-react';
import useUIStore from '@/stores/ui.store.ts';
import { Button } from '../ui/button';
import { VisuallyHidden } from 'radix-ui';

function CompressionProgressDialog() {
  const {
    isCompressing,
    compressionProgress,
    isCompressionCancelling,
    isCompressionPaused,
    totalFiles,
    invokePauseCompression,
    invokeCancelCompression,
    invokeResumeCompression,
  } = useFileListStore();
  const { compressionProgressDialogMinimized, setCompressionProgressDialogMinimized } = useUIStore();
  const { t } = useTranslation();
  const setProgressLabel = function () {
    if (isCompressionCancelling) {
      return t('compression_status.finishing_dots');
    } else if (isCompressionPaused) {
      return t('compression_status.paused');
    }

    return t('compression_status.compressing_dots');
  };
  return (
    <Dialog open={isCompressing && !compressionProgressDialogMinimized}>
      <DialogContent
        className="sm:max-w-sm"
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <VisuallyHidden.Root>
          <DialogHeader>
            <DialogTitle className="sr-only">{setProgressLabel()}</DialogTitle>
          </DialogHeader>
        </VisuallyHidden.Root>
        <DialogBody className="flex flex-col items-center gap-2">
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex w-full flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span>{setProgressLabel()}</span>
                {!isCompressionCancelling && totalFiles > 0 && (
                  <span>{Math.round((compressionProgress / totalFiles) * 100)}%</span>
                )}
              </div>
              <Progress
                aria-label={setProgressLabel()}
                value={isCompressionCancelling ? undefined : (compressionProgress / totalFiles) * 100}
              />
            </div>
            <Button
              disabled={isCompressionCancelling}
              size="icon-sm"
              title={isCompressionPaused ? t('resume') : t('pause')}
              variant="ghost"
              onClick={isCompressionPaused ? invokeResumeCompression : invokePauseCompression}
            >
              {isCompressionPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </Button>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex w-full items-center justify-between gap-2">
            <Button
              title={'Hide'} //TODO
              variant="ghost"
              onClick={() => setCompressionProgressDialogMinimized(true)}
            >
              Hide
            </Button>
            <Button title={t('cancel')} variant="destructive" onClick={invokeCancelCompression}>
              <X /> {t('cancel')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CompressionProgressDialog;
