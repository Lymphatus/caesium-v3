import { create } from 'zustand';
import { CImage } from '@/types.ts';
import { invoke } from '@tauri-apps/api/core';

interface FileListStore {
  fileList: CImage[];
  baseFolder: string;
  openFiles: () => Promise<void>;
  setFileList: (files: CImage[]) => void;
  setBaseFolder: (folder: string) => void;
}

const useFileListStore = create<FileListStore>()((set) => ({
  fileList: [],
  baseFolder: '',

  openFiles: async () => await invoke('open_import_files_dialog'),

  setFileList: (files: CImage[]) => set({ fileList: files }),

  setBaseFolder: (folder: string) => set({ baseFolder: folder }),
}));

export default useFileListStore;
