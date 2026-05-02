import useFileListStore from '@/stores/file-list.store.ts';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { Info, Pause, Play, X } from 'lucide-react';
import useAppStore from '@/stores/app.store.ts';
import useUIStore from '@/stores/ui.store.ts';
import { isInDevelopmentMode } from '@/utils/utils.ts';
import { Button } from './ui/button';

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
    <div className="text-muted-foreground flex h-[36px] w-full items-center justify-between px-2 py-1.5 text-xs">
      <div className="flex items-center gap-2">
        <span>{t('files_in_list', { total: totalFiles })}</span>
        {isInDevelopmentMode() && (
          <>
            <Separator orientation="vertical" />
            <span>{baseFolder || '-'}</span>
          </>
        )}
      </div>
      {isCompressing && compressionProgressDialogMinimized && (
        <div className="flex items-center justify-center gap-1 text-xs">
          <span>{setProgressLabel()}</span>
          <div className="max-w-[50%] min-w-60">
            <Button
              className="h-5 w-full p-1"
              variant="ghost"
              onClick={() => setCompressionProgressDialogMinimized(false)}
            >
              <div className="flex w-full items-center gap-1">
                <Progress
                  aria-label="compressionProgress"
                  value={isCompressionCancelling ? undefined : (compressionProgress / totalFiles) * 100}
                />
                {!isCompressionCancelling && totalFiles > 0 && (
                  <span className="text-xs">{Math.round((compressionProgress / totalFiles) * 100)}%</span>
                )}
              </div>
            </Button>
          </div>

          <Button
            disabled={isCompressionCancelling}
            size="icon-xs"
            title={isCompressionPaused ? t('resume') : t('pause')}
            variant="ghost"
            onClick={isCompressionPaused ? invokeResumeCompression : invokePauseCompression}
          >
            {isCompressionPaused ? <Play></Play> : <Pause></Pause>}
          </Button>
          <Button
            disabled={isCompressionCancelling}
            size="icon-xs"
            title={t('cancel')}
            variant="destructive"
            onClick={invokeCancelCompression}
          >
            <X></X>
          </Button>
          {isCompressing && appUpdate !== null && <Separator className="ml-2 h-full" orientation="vertical" />}
          {appUpdate !== null && (
            <Button className="gap-1 px-2" size="xs" variant="ghost" onClick={() => setCheckForUpdatesDialogOpen(true)}>
              <Info></Info>
              {t('update_process.new_update_available_short')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default Footer;
