import { useEffect } from 'react';
import Toolbar from '@/components/Toolbar.tsx';
import Footer from '@/components/Footer.tsx';
import ImportDialog from '@/components/dialogs/ImportDialog.tsx';
import CenterContainer from '@/components/CenterContainer.tsx';
import useFileListStore from '@/stores/file-list.store.ts';
import { listen } from '@tauri-apps/api/event';
import { CImage } from '@/types.ts';
import { addToast } from '@heroui/react';
import SettingsDialog from '@/components/dialogs/SettingsDialog.tsx';

function App() {
  const { setFileList, setBaseFolder, setIsImporting, setTotalFiles, setImportProgress } = useFileListStore();

  useEffect(() => {
    const unlistenFinished = listen('fileImporter:importFinished', () => {
      setIsImporting(false);
      addToast({
        title: 'Import finished',
        description: 'Imported a few files',
        // timeout: 3000,
        color: 'success',
      });
    });

    const unlistenGetList = listen<{ files: CImage[]; base_folder: string; total_files: number }>(
      'fileList:getList',
      (event) => {
        const { files, base_folder, total_files } = event.payload;
        setFileList(files);
        setBaseFolder(base_folder);
        setTotalFiles(total_files);
        setIsImporting(false);
      },
    );

    const unlistenStarted = listen('fileImporter:importStarted', () => {
      setImportProgress(0);
      setIsImporting(true);
    });

    const unlistenProgress = listen<{ progress: number; total: number }>('fileImporter:importProgress', (event) => {
      const { progress } = event.payload;
      setImportProgress(progress);
    });

    // Cleanup function to remove listeners when component unmounts
    return () => {
      Promise.all([unlistenFinished, unlistenGetList, unlistenStarted, unlistenProgress]).then((cleanupFns) => {
        cleanupFns.forEach((cleanupFn) => cleanupFn());
      });
    };
  }, []);

  return (
    <>
      <Toolbar></Toolbar>
      <CenterContainer></CenterContainer>
      <Footer></Footer>

      <ImportDialog></ImportDialog>
      <SettingsDialog></SettingsDialog>
    </>
  );
}

export default App;
