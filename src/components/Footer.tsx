import useFileListStore from '@/stores/file-list.store.ts';
import { Button, Divider, Progress } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { Pause, Play, Square } from 'lucide-react';

function Footer() {
  const {
    baseFolder,
    totalFiles,
    compressionProgress,
    isCompressing,
    isCompressionPaused,
    isCompressionCancelling,
    invokePauseCompression,
    invokeCancelCompression,
    invokeResumeCompression,
  } = useFileListStore();
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
    <div className="bg-content1 flex h-[40px] w-full items-center justify-between px-4 text-sm">
      <div>
        <div className="text-default-500 flex items-center gap-2">
          <span>{t('files_in_list', { total: totalFiles })}</span>
          {import.meta.env.MODE === 'development' && (
            <>
              <Divider className="h-[24px]" orientation="vertical"></Divider>
              <span>{baseFolder}</span>
            </>
          )}
        </div>
      </div>
      {isCompressing && (
        <div className="flex items-center justify-center gap-2">
          <div className="max-w-[50%] min-w-60">
            <Progress
              disableAnimation
              showValueLabel
              aria-label="compressionProgress"
              className="w-full gap-1"
              isIndeterminate={isCompressionCancelling}
              label={setProgressLabel()}
              maxValue={totalFiles}
              minValue={0}
              size="sm"
              value={compressionProgress}
            ></Progress>
          </div>

          {!isCompressionPaused && (
            <Button
              disableRipple
              isIconOnly
              className="max-h-[32px] max-w-[32px] min-w-[32px]"
              size="sm"
              title={t('pause')}
              variant="light"
              onPress={invokePauseCompression}
            >
              <Pause className="size-4"></Pause>
            </Button>
          )}
          {isCompressionPaused && (
            <Button
              disableRipple
              isIconOnly
              className="max-h-[32px] max-w-[32px] min-w-[32px]"
              size="sm"
              title={t('resume')}
              variant="light"
              onPress={invokeResumeCompression}
            >
              <Play className="size-4"></Play>
            </Button>
          )}
          <Button
            disableRipple
            isIconOnly
            className="max-h-[32px]"
            size="sm"
            title={t('stop')}
            variant="light"
            onPress={invokeCancelCompression}
          >
            <Square className="size-4"></Square>
          </Button>
        </div>
      )}
    </div>
  );
}

export default Footer;
