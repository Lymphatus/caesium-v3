import { useEffect, useState } from 'react';
import './assets/css/App.css';
import { listen } from '@tauri-apps/api/event';
import { CImage } from './types.ts';
import { Button } from '@/components/ui/button.tsx';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable.tsx';
import Toolbar from '@/components/Toolbar.tsx';
import Footer from '@/components/Footer.tsx';
import useFileListStore from '@/stores/file-list.store.ts';
import ImportDialog from '@/components/ImportDialog.tsx';

function App() {
  const [status, setStatus] = useState('Ready');
  const [isImporting, setIsImporting] = useState(false);
  const { fileList, openFiles, setFileList, baseFolder, setBaseFolder } = useFileListStore();

  useEffect(() => {
    listen<{ files: CImage[]; base_folder: string }>('fileImporter:importFinished', (event) => {
      setFileList(event.payload.files);
      setBaseFolder(event.payload.base_folder);
      setStatus('Done');
      setTimeout(() => setIsImporting(false), 2000);
      // setIsImporting(false);
    }).then();

    listen('fileImporter:importStarted', () => {
      setIsImporting(true);
      setStatus('Scanning...');
    }).then();

    listen<{ progress: number; total: number }>('fileImporter:importProgress', (event) => {
      const p = event.payload.progress;
      const t = event.payload.total;
      setStatus(`Importing (${p}/${t})`);
    }).then();
  }, []);

  const listItems = fileList.map((path) => <li key={path.id}>{path.path}</li>);

  return (
    <main className="w-screen h-screen text-center bg-card text-foreground px-1">
      <Toolbar></Toolbar>
      <div className="center-container py-1">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={60} minSize={20} maxSize={80}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={75} minSize={20} maxSize={80}>
                <div className="size-full">
                  <div className="bg-background size-full rounded">
                    <h1 className="text-xl font-bold">Welcome to Tauri + React + Tailwind</h1>

                    <Button variant={'secondary'} onClick={openFiles}>
                      Open
                    </Button>
                    <h2 className="text-bold text-lg">{status}</h2>
                    <p className="font-bold">{baseFolder}</p>
                    <ul>{listItems}</ul>
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle className="hover:bg-primary bg-transparent" />
              <ResizablePanel defaultSize={25} minSize={20} maxSize={80}>
                <div className="size-full">
                  <div className="bg-background size-full rounded">IMG</div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle className="hover:bg-primary bg-transparent" />
          <ResizablePanel defaultSize={40} minSize={20} maxSize={80}>
            <div className="size-full">
              <div className="bg-background size-full rounded">TWO</div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <Footer></Footer>

      <ImportDialog isOpen={isImporting} onOpenChange={() => console.log('openChanged')}></ImportDialog>
    </main>
  );
}

export default App;
