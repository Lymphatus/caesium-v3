import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { Progress } from '@/components/ui/progress';
import useFileListStore from '@/stores/file-list.store.ts';
import { useTranslation } from 'react-i18next';
import { Pause, Play, X } from 'lucide-react';
import useUIStore from '@/stores/ui.store.ts';
import { Button } from '../ui/button';

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
    <Modal
      hideCloseButton
      isKeyboardDismissDisabled
      backdrop="blur"
      classNames={{
        backdrop: 'bg-content3/50',
      }}
      isDismissable={false}
      isOpen={isCompressing && !compressionProgressDialogMinimized}
      shadow="none"
      size="sm"
    >
      <ModalContent>
        <ModalHeader></ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center gap-2">
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex w-full flex-col gap-1">
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
                variant="outline"
                onClick={isCompressionPaused ? invokeResumeCompression : invokePauseCompression}
              >
                {isCompressionPaused ? <Play className="size-4"></Play> : <Pause className="size-4"></Pause>}
              </Button>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full items-center justify-between gap-2">
            <Button
              title={'Hide'} //TODO
              variant="ghost"
              onClick={() => setCompressionProgressDialogMinimized(true)}
            >
              Hide
            </Button>
            <Button title={t('cancel')} variant="destructive" onClick={invokeCancelCompression}>
              <X></X> {t('cancel')}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CompressionProgressDialog;
