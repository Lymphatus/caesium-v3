import { useEffect, useRef, useState } from 'react';
import Toolbar from '@/components/Toolbar.tsx';
import Footer from '@/components/Footer.tsx';
import ImportDialog from '@/components/dialogs/ImportDialog.tsx';
import CenterContainer from '@/components/CenterContainer.tsx';
import useFileListStore from '@/stores/file-list.store.ts';
import { listen, TauriEvent, UnlistenFn } from '@tauri-apps/api/event';
import { CImage, CompressionFinished, FileListPayload, THEME } from '@/types.ts';
import { toast } from 'sonner';
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
import { exitApplication, getSavedPercentage, saveCompressionReport, setDocumentTheme } from '@/utils/utils.ts';
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

  const closeEventCallback = async () => {
    if (useSettingsStore.getState().promptBeforeExit && !useSettingsStore.getState().skipMessagesAndDialogs) {
      setPromptExitDialogOpen(true);
    } else {
      await exitApplication();
    }
  };

  const closeRequestedUnlistenRef = useRef<UnlistenFn | null>(null);

  const registerCloseRequestedListener = () => {
    getCurrentWindow()
      .once(TauriEvent.WINDOW_CLOSE_REQUESTED, closeEventCallback)
      .then((unlisten) => {
        closeRequestedUnlistenRef.current = unlisten;
      })
      .catch((e) => {
        void error(`Failed to register close-requested listener: ${e}`);
      });
  };

  useEffect(() => {
    const unlistenFns: UnlistenFn[] = [];
    let cancelled = false;

    const register = (p: Promise<UnlistenFn>) => {
      p.then((fn) => {
        if (cancelled) {
          fn();
        } else {
          unlistenFns.push(fn);
        }
      }).catch((e) => {
        void error(`Failed to register listener: ${e}`);
      });
    };

    register(
      listen(TauriEvent.WINDOW_THEME_CHANGED, (event) => {
        const eventTheme = event.payload as Theme;
        if (theme !== THEME.SYSTEM) {
          return;
        }

        if (eventTheme === 'dark') {
          setDocumentTheme(THEME.DARK);
        } else if (eventTheme === 'light') {
          setDocumentTheme(THEME.LIGHT);
        }
      }),
    );

    register(
      listen<{ paths: string[]; position: { x: number; y: number } }>(TauriEvent.DRAG_DROP, (event) => {
        const filePaths = event.payload.paths;
        setIsDragging(false);

        void invokeBackend('add_from_drop', { filesOrFolders: filePaths, recursive: importSubfolderOnInput });
      }),
    );

    register(
      listen(TauriEvent.DRAG_OVER, () => {
        setIsDragging(true);
      }),
    );

    register(
      listen('tauri://drag-leave', () => {
        setIsDragging(false);
      }),
    );

    register(
      listen<{ original_list_length: number; new_list_length: number }>('fileImporter:importFinished', (event) => {
        setIsImporting(false);
        toast.success('Import finished', {
          description: `Imported ${event.payload.new_list_length - event.payload.original_list_length} files`,
        });
      }),
    );

    register(
      listen<FileListPayload>('fileList:getList', (event) => {
        updateList(event.payload);
      }),
    );

    register(
      listen('fileImporter:importStarted', () => {
        setImportProgress(0);
        setIsImporting(true);
      }),
    );

    register(
      listen<{ progress: number; total: number }>('fileImporter:importProgress', (event) => {
        const { progress } = event.payload;
        setImportProgress(progress);
      }),
    );

    register(
      listen<{ status: number; cimage: CImage }>('fileList:updateCImage', async (event) => {
        const { cimage } = event.payload;
        updateFile(cimage.id, cimage);
        if (getCurrentPreviewedCImage()?.id === cimage.id) {
          usePreviewStore.setState({ currentPreviewedCImage: cimage });
        }
      }),
    );

    register(
      listen<number>('fileList:compressionProgress', async (event) => {
        setCompressionProgress(event.payload);
      }),
    );

    register(
      listen<CompressionFinished>('fileList:compressionFinished', (event) => {
        finishCompression();
        void showNotification({
          title: t('compression_report.compression_finished'),
          body: t('compression_report.saved_long', {
            saved: prettyBytes(event.payload.original_size - event.payload.compressed_size),
            savedPercent: getSavedPercentage(event.payload.original_size, event.payload.compressed_size),
          }),
        });
        toast.success(t('compression_report.compression_finished'), {
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
                {t('compression_report.compressed_size', {
                  compressedSize: prettyBytes(event.payload.compressed_size),
                })}
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
          duration: 5000,
        });
        void saveCompressionReport(event.payload);
      }),
    );

    register(
      listen('fileList:compressionPaused', () => {
        setIsCompressionPaused(true);
        setIsCompressionCancelling(false);
      }),
    );

    registerCloseRequestedListener();

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
      cancelled = true;
      for (const fn of unlistenFns) fn();
      closeRequestedUnlistenRef.current?.();
      closeRequestedUnlistenRef.current = null;
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
      <PromptOnExitDialog
        onCancel={() => {
          registerCloseRequestedListener();
          setPromptExitDialogOpen(false);
        }}
        onConfirm={async () => {
          await exitApplication();
        }}
      ></PromptOnExitDialog>
    </>
  );
}

export default App;
