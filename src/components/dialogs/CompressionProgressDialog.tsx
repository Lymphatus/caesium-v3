import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Progress } from '@heroui/react';
import useFileListStore from '@/stores/file-list.store.ts';
import { useTranslation } from 'react-i18next';
import { Pause, Play, X } from 'lucide-react';
import useUIStore from '@/stores/ui.store.ts';

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
              <Progress
                disableAnimation
                aria-label={setProgressLabel()}
                className="w-full gap-1"
                isIndeterminate={isCompressionCancelling}
                label={setProgressLabel()}
                maxValue={totalFiles}
                minValue={0}
                showValueLabel={true}
                size="sm"
                value={compressionProgress}
              ></Progress>
              <Button
                disableRipple
                isIconOnly
                className="size-8"
                isDisabled={isCompressionCancelling}
                size="sm"
                title={isCompressionPaused ? t('resume') : t('pause')}
                variant="flat"
                onPress={isCompressionPaused ? invokeResumeCompression : invokePauseCompression}
              >
                {isCompressionPaused ? <Play className="size-4"></Play> : <Pause className="size-4"></Pause>}
              </Button>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full items-center justify-between gap-2">
            <Button
              disableRipple
              title={'Hide'} //TODO
              variant="light"
              onPress={() => setCompressionProgressDialogMinimized(true)}
            >
              Hide
            </Button>
            <Button disableRipple title={t('cancel')} variant="solid" onPress={invokeCancelCompression}>
              <X className="size-4"></X> {t('cancel')}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CompressionProgressDialog;
