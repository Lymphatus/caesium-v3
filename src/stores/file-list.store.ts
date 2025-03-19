import { create } from 'zustand';
import { CImage } from '@/types.ts';
import { invoke } from '@tauri-apps/api/core';

interface FileListStore {
  fileList: CImage[];
  baseFolder: string;
  isImporting: boolean;
  setIsImporting: (isImporting: boolean) => void;
  openPickerDialogs: (type: 'files' | 'folder') => Promise<void>;
  setFileList: (files: CImage[]) => void;
  setBaseFolder: (folder: string) => void;
}

const useFileListStore = create<FileListStore>()((set) => ({
  fileList: [],
  baseFolder: '',
  isImporting: false,

  openPickerDialogs: async (type: 'files' | 'folder') => {
    switch (type) {
      case 'files':
        await invoke('open_import_files_dialog');
        break;
      case 'folder':
        await invoke('open_import_folder_dialog');
        break;
      default:
    }
  },
  setFileList: (files: CImage[]) => set({ fileList: files }),
  setBaseFolder: (folder: string) => set({ baseFolder: folder }),
  setIsImporting: (isImporting: boolean) => set({ isImporting }),
}));

export default useFileListStore;
