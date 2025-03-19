import { useEffect, useState } from 'react';
import './assets/css/App.css';
import Toolbar from '@/components/Toolbar.tsx';
import Footer from '@/components/Footer.tsx';
import ImportDialog from '@/components/ImportDialog.tsx';
import CenterContainer from '@/components/CenterContainer.tsx';
import useFileListStore from '@/stores/file-list.store.ts';
import { listen } from '@tauri-apps/api/event';
import { CImage } from '@/types.ts';

function App() {
  const [importProgress, setImportProgress] = useState(0);
  const { setFileList, setBaseFolder, isImporting, setIsImporting } = useFileListStore();

  useEffect(() => {
    listen('fileImporter:importFinished', () => {
      setIsImporting(false);
    }).then();

    listen<{ files: CImage[]; base_folder: string }>('fileList:getList', (event) => {
      const { files, base_folder } = event.payload;
      setFileList(files);
      setBaseFolder(base_folder);
      setIsImporting(false);
    }).then();

    listen('fileImporter:importStarted', () => {
      setImportProgress(0);
      setIsImporting(true);
    }).then();

    listen<{ progress: number; total: number }>('fileImporter:importProgress', (event) => {
      const { progress, total } = event.payload;
      setImportProgress((progress / total) * 100);
    }).then();
  }, []);

  return (
    <main className="w-screen h-screen text-center bg-card text-foreground px-1">
      <Toolbar></Toolbar>
      <CenterContainer></CenterContainer>
      <Footer></Footer>

      <ImportDialog
        hideCloseButton={true}
        isOpen={isImporting}
        onOpenChange={() => console.log('openChanged')}
        importProgress={importProgress}
      ></ImportDialog>
    </main>
  );
}

export default App;
