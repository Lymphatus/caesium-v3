import useFileListStore from '@/stores/file-list.store.ts';
import { Button, Divider, Link, Progress } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { Info, Pause, Play, X } from 'lucide-react';
import useAppStore from '@/stores/app.store.ts';
import useUIStore from '@/stores/ui.store.ts';
import { isInDevelopmentMode } from '@/utils/utils.ts';

function Footer() {
  const { appUpdate } = useAppStore();
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
  const { setCheckForUpdatesDialogOpen, compressionProgressDialogMinimized, setCompressionProgressDialogMinimized } =
    useUIStore();
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
    <div className="bg-content1 flex h-10 w-full items-center justify-between px-4 text-sm">
      <div>
        <div className="text-default-500 flex items-center gap-2">
          <span>{t('files_in_list', { total: totalFiles })}</span>
          {isInDevelopmentMode() && (
            <>
              <Divider className="h-6" orientation="vertical"></Divider>
              <span>{baseFolder || '-'}</span>
            </>
          )}
        </div>
      </div>
      {isCompressing && compressionProgressDialogMinimized && (
        <div className="flex items-center justify-center gap-2">
          <div className="max-w-[50%] min-w-60">
            <Button
              disableAnimation
              disableRipple
              className="w-full"
              size="sm"
              variant="light"
              onPress={() => setCompressionProgressDialogMinimized(false)}
            >
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
            </Button>
          </div>

          <Button
            disableRipple
            isIconOnly
            className="size-8"
            isDisabled={isCompressionCancelling}
            size="sm"
            title={isCompressionPaused ? t('resume') : t('pause')}
            variant="light"
            onPress={isCompressionPaused ? invokeResumeCompression : invokePauseCompression}
          >
            {isCompressionPaused ? <Play className="size-4"></Play> : <Pause className="size-4"></Pause>}
          </Button>
          <Button
            disableRipple
            isIconOnly
            className="max-h-8"
            size="sm"
            title={t('cancel')}
            variant="light"
            onPress={invokeCancelCompression}
          >
            <X className="size-4"></X>
          </Button>
          {isCompressing && appUpdate !== null && <Divider className="h-6" orientation="vertical"></Divider>}
          {appUpdate !== null && (
            <>
              <Link
                isBlock
                className="flex items-center gap-1"
                color="secondary"
                href="#"
                size="sm"
                onPress={() => setCheckForUpdatesDialogOpen(true)}
              >
                <Info className="size-4"></Info>
                {t('update_process.new_update_available_short')}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Footer;
