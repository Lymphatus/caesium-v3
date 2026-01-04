import { useEffect, useState } from 'react';
import Toolbar from '@/components/Toolbar.tsx';
import Footer from '@/components/Footer.tsx';
import ImportDialog from '@/components/dialogs/ImportDialog.tsx';
import CenterContainer from '@/components/CenterContainer.tsx';
import useFileListStore from '@/stores/file-list.store.ts';
import { listen, TauriEvent } from '@tauri-apps/api/event';
import { CImage, CompressionFinished, FileListPayload, THEME } from '@/types.ts';
import { addToast } from '@heroui/react';
import SettingsDialog from '@/components/dialogs/settings/SettingsDialog.tsx';
import usePreviewStore from '@/stores/preview.store.ts';
import AboutDialog from './components/dialogs/AboutDialog';
import { getCurrentWindow, Theme } from '@tauri-apps/api/window';
import useSettingsStore from '@/stores/settings.store.ts';
import useUIStore from '@/stores/ui.store.ts';
import { useTranslation } from 'react-i18next';
import CheckForUpdatesDialog from '@/components/dialogs/CheckForUpdatesDialog.tsx';
import prettyBytes from 'pretty-bytes';
import DragDropOverlay from '@/components/DragDropOverlay.tsx';
import AdvancedImportDialog from '@/components/dialogs/AdvancedImportDialog.tsx';
import { getSavedPercentage, saveCompressionReport, setDocumentTheme } from '@/utils/utils.ts';
import { invokeBackend } from '@/utils/invoker.tsx';
import { check } from '@tauri-apps/plugin-updater';
import useAppStore from '@/stores/app.store.ts';
import { error, info } from '@tauri-apps/plugin-log';
import CompressionProgressDialog from '@/components/dialogs/CompressionProgressDialog.tsx';
import { showNotification } from '@/utils/notification-manager.ts';
import PromptOnExitDialog from '@/components/dialogs/PromptOnExitDialog.tsx';

function App() {
  const {
    setIsImporting,
    setImportProgress,
    updateFile,
    setCompressionProgress,
    currentPage,
    updateList,
    finishCompression,
    setIsCompressionPaused,
    setIsCompressionCancelling,
  } = useFileListStore();

  const { getCurrentPreviewedCImage } = usePreviewStore();
  const { setPromptExitDialogOpen } = useUIStore();
  const { importSubfolderOnInput, theme, checkUpdatesAtStartup } = useSettingsStore();
  const { t } = useTranslation();
  const { setAppUpdate } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const themeChangedListener = listen(TauriEvent.WINDOW_THEME_CHANGED, (event) => {
      const eventTheme = event.payload as Theme;
      if (theme !== THEME.SYSTEM) {
        return;
      }

      if (eventTheme === 'dark') {
        setDocumentTheme(THEME.DARK);
      } else if (eventTheme === 'light') {
        setDocumentTheme(THEME.LIGHT);
      }
    });

    const dragDropListener = listen<{ paths: string[]; position: { x: number; y: number } }>(
      TauriEvent.DRAG_DROP,
      (event) => {
        const filePaths = event.payload.paths;
        setIsDragging(false);

        void invokeBackend('add_from_drop', { filesOrFolders: filePaths, recursive: importSubfolderOnInput });
      },
    );

    const dragOverListener = listen(TauriEvent.DRAG_OVER, () => {
      setIsDragging(true);
    });

    const dragLeaveListener = listen('tauri://drag-leave', () => {
      setIsDragging(false);
    });

    const importFinishedListener = listen<{ original_list_length: number; new_list_length: number }>(
      'fileImporter:importFinished',
      (event) => {
        setIsImporting(false);
        addToast({
          title: 'Import finished',
          description: `Imported ${event.payload.new_list_length - event.payload.original_list_length} files`,
          color: 'success',
        });
      },
    );

    const getListListener = listen<FileListPayload>('fileList:getList', (event) => {
      updateList(event.payload);
    });

    const importStartedListener = listen('fileImporter:importStarted', () => {
      setImportProgress(0);
      setIsImporting(true);
    });

    const importProgressListener = listen<{ progress: number; total: number }>(
      'fileImporter:importProgress',
      (event) => {
        const { progress } = event.payload;
        setImportProgress(progress);
      },
    );

    const updateCImageListener = listen<{ status: number; cimage: CImage }>('fileList:updateCImage', async (event) => {
      const { cimage } = event.payload;
      updateFile(cimage.id, cimage);
      if (getCurrentPreviewedCImage()?.id === cimage.id) {
        usePreviewStore.setState({ currentPreviewedCImage: cimage });
      }
    });

    const updateCompressionProgressListener = listen<number>('fileList:compressionProgress', async (event) => {
      setCompressionProgress(event.payload);
    });

    const compressionFinishedListener = listen<CompressionFinished>('fileList:compressionFinished', (event) => {
      finishCompression();
      void showNotification({
        title: t('compression_report.compression_finished'),
        body: t('compression_report.saved_long', {
          saved: prettyBytes(event.payload.original_size - event.payload.compressed_size),
          savedPercent: getSavedPercentage(event.payload.original_size, event.payload.compressed_size),
        }),
      });
      addToast({
        title: t('compression_report.compression_finished'),
        hideIcon: true,
        description: (
          <div className="flex flex-col gap-1">
            <span>
              {t('compression_report.total_files', { total: event.payload.total_images })} (
              {t('compression_report.compressed', { compressed: event.payload.total_success })} |{' '}
              {t('compression_report.skipped', { skipped: event.payload.total_skipped })} |{' '}
              {t('compression_report.errors', { errors: event.payload.total_errors })})
            </span>
            <span>
              {t('compression_report.original_size', { originalSize: prettyBytes(event.payload.original_size) })}
            </span>
            <span>
              {t('compression_report.compressed_size', { compressedSize: prettyBytes(event.payload.compressed_size) })}
            </span>
            <span>
              {t('compression_report.saved', {
                saved: prettyBytes(event.payload.original_size - event.payload.compressed_size),
                savedPercent: getSavedPercentage(event.payload.original_size, event.payload.compressed_size),
              })}
            </span>
            <span>{t('compression_report.total_time', { totalTime: event.payload.total_time })} ms</span>
          </div>
        ),
        timeout: 0,
        color: 'success',
      });
      void saveCompressionReport(event.payload);
    });

    const closeRequestedListener = getCurrentWindow().listen(TauriEvent.WINDOW_CLOSE_REQUESTED, async () => {
      if (useSettingsStore.getState().promptBeforeExit && !useSettingsStore.getState().skipMessagesAndDialogs) {
        setPromptExitDialogOpen(true);
      } else {
        //Avoid infinite loop
        await getCurrentWindow().destroy();
      }
    });

    const compressionPausedListener = listen('fileList:compressionPaused', () => {
      setIsCompressionPaused(true);
      setIsCompressionCancelling(false);
    });

    invokeBackend<FileListPayload>('change_page', { page: currentPage }).then((payload) => updateList(payload));

    if (checkUpdatesAtStartup) {
      void info('Checking for updates at startup...');
      check({ timeout: 5000 })
        .then((update) => {
          if (update !== null) {
            void info(`New update available: ${update?.version}`);
            setAppUpdate(update);
          } else {
            void info('No updates available');
          }
        })
        .catch((err) => {
          void error(`Error checking for updates: ${err}`);
        });
    }

    return () => {
      Promise.all([
        importFinishedListener,
        getListListener,
        importStartedListener,
        importProgressListener,
        updateCImageListener,
        closeRequestedListener,
        updateCompressionProgressListener,
        compressionFinishedListener,
        dragDropListener,
        dragOverListener,
        dragLeaveListener,
        compressionPausedListener,
        themeChangedListener,
      ]).then((cleanupFns) => {
        cleanupFns.forEach((cleanupFn) => cleanupFn());
      });
    };
  }, []);

  return (
    <>
      <Toolbar></Toolbar>
      <CenterContainer></CenterContainer>
      <Footer></Footer>

      <DragDropOverlay isDragging={isDragging}></DragDropOverlay>
      <ImportDialog></ImportDialog>
      <SettingsDialog></SettingsDialog>
      <AboutDialog></AboutDialog>
      <CheckForUpdatesDialog></CheckForUpdatesDialog>
      <AdvancedImportDialog></AdvancedImportDialog>
      <CompressionProgressDialog></CompressionProgressDialog>
      <PromptOnExitDialog></PromptOnExitDialog>
    </>
  );
}

export default App;
