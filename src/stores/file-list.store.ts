import { create } from 'zustand';
import { CImage } from '@/types.ts';
import { invoke } from '@tauri-apps/api/core';

interface FileListStore {
  fileList: CImage[];
  baseFolder: string | null;
  isImporting: boolean;
  currentPage: number;
  totalFiles: number;
  importProgress: number;

  totalPages: () => number;

  setIsImporting: (isImporting: boolean) => void;
  openPickerDialogs: (type: 'files' | 'folder') => Promise<void>;
  setFileList: (files: CImage[]) => void;
  setBaseFolder: (folder: string) => void;
  setCurrentPage: (page: number) => void;
  setTotalFiles: (totalFiles: number) => void;
  setImportProgress: (progress: number) => void;
}

const useFileListStore = create<FileListStore>()((set, get) => ({
  fileList: [],
  baseFolder: null,
  isImporting: false,
  currentPage: 1,
  totalFiles: 0,
  importProgress: 0,
  currentPreviewedCImage: null,

  totalPages: () => Math.ceil(get().totalFiles / 50),

  openPickerDialogs: async (type: 'files' | 'folder') => {
    if (type === 'files') {
      await invoke('open_import_files_dialog');
    } else {
      await invoke('open_import_folder_dialog');
    }
  },
  setFileList: (files: CImage[]) => set({ fileList: files }),
  setBaseFolder: (folder: string) => set({ baseFolder: folder }),
  setIsImporting: (isImporting: boolean) => set({ isImporting }),
  setCurrentPage: (page: number) => set({ currentPage: page }),
  setTotalFiles: (totalFiles: number) => set({ totalFiles }),
  setImportProgress: (progress: number) => set({ importProgress: progress }),
}));

export default useFileListStore;
