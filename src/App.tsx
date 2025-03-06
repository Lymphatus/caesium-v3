import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './assets/css/App.css';
import { listen } from '@tauri-apps/api/event';

function App() {
  useEffect(() => {
    listen<{files: string[], base_folder: string}>('fileImporter:importFinished', event => {
      setFiles(event.payload.files);
      setBaseFolder(event.payload.base_folder);
    }).then();
  }, []);

  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [baseFolder, setBaseFolder] = useState('');

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke('greet', { name }));
  }

  async function open_files() {
    await invoke('open_import_files_dialog');
  }

  const listItems = files.map((path) =>
    <p>{ path }</p>
  );

  return (

    <main className="w-screen h-screen bg-red-200 text-center">
      <h1>Welcome to Tauri + React + Tailwind</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>

      <button className="bg-white border border-gray-300 rounded-md px-4 py-2 m-2" onClick={open_files}>Open</button>

      <p className="font-bold">{baseFolder}</p>
      {listItems}
    </main>
  );
}

export default App;
