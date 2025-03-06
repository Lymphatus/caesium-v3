import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './assets/css/App.css';
import { listen } from '@tauri-apps/api/event';

function App() {
  useEffect(() => {
    listen<{files: string[], base_folder: string}>('fileImporter:importFinished', event => {
      setFiles(event.payload.files);
      setBaseFolder(event.payload.base_folder);
      setStatus('Done');
    }).then();

    listen('fileImporter:importStarted', () => {
      setStatus('Scanning...');
    }).then();

    listen<{progress: number, total: number}>('fileImporter:importProgress', event => {
      const p = event.payload.progress;
      const t = event.payload.total;
      setStatus(`Importing (${p}/${t})`);
    }).then();
  }, []);

  const [files, setFiles] = useState<string[]>([]);
  const [baseFolder, setBaseFolder] = useState('');
  const [status, setStatus] = useState('Ready');

  async function open_files() {
    await invoke('open_import_files_dialog');
  }

  const listItems = files.map((path) =>
    <li>{ path }</li>
  );

  return (
    <main className="w-screen h-screen bg-gray-200 text-center">
      <h1 className="text-xl font-bold">Welcome to Tauri + React + Tailwind</h1>

      <button className="bg-white border border-gray-300 rounded-md px-4 py-2 m-2" onClick={open_files}>Open</button>
      <h2 className="text-bold text-lg">{status}</h2>
      <p className="font-bold">{baseFolder}</p>
      <ul>
        {listItems}
      </ul>
    </main>
  );
}

export default App;
