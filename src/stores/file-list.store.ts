import { create } from 'zustand';
import { CImage, FileListPayload } from '@/types.ts';
import { createJSONStorage, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import useSettingsStore from '@/stores/settings.store.ts';
import useCompressionOptionsStore from '@/stores/compression-options.store.ts';
import useResizeOptionsStore from '@/stores/resize-options.store.ts';
import useOutputOptionsStore from '@/stores/output-options.store.ts';
import { SortDescriptor } from '@heroui/react';
import { execPostCompressionAction } from '@/services/post-compression-actions.ts';
import { invokeBackend } from '@/utils/invoker.tsx';

interface FileListStore {
  fileList: CImage[];
  baseFolder: string | null;
  isImporting: boolean;
  currentPage: number;
  totalFiles: number;
  importProgress: number;
  isListLoading: boolean;
  selectedItems: CImage[];
  isCompressing: boolean;
  isCompressionPaused: boolean;
  isCompressionCancelling: boolean;
  compressionProgress: number;
  currentSorting: SortDescriptor;

  totalPages: () => number;

  setIsImporting: (isImporting: boolean) => void;
  openPickerDialogs: (type: 'files' | 'folder') => Promise<void>;
  setFileList: (files: CImage[]) => void;
  setBaseFolder: (folder: string) => void;
  setCurrentPage: (page: number) => void;
  setTotalFiles: (totalFiles: number) => void;
  setImportProgress: (progress: number) => void;
  setIsListLoading: (isListLoading: boolean) => void;
  setSelectedItems: (items: CImage[]) => void;
  setIsCompressing: (isCompressing: boolean) => void;
  setIsCompressionPaused: (isCompressionPaused: boolean) => void;
  setIsCompressionCancelling: (isCompressionCancelling: boolean) => void;
  setCompressionProgress: (progress: number) => void;
  updateFile: (id: string, updatedData: Partial<CImage>) => void;
  setCurrentSorting: (sorting: SortDescriptor) => void;

  invokeCompress: (ids?: string[]) => void;
  invokePauseCompression: () => void;
  invokeResumeCompression: () => void;
  invokeCancelCompression: () => void;
  updateList: (payload: FileListPayload) => void;
  filterList: (query: string) => void;
  finishCompression: () => void;
}

const useFileListStore = create<FileListStore>()(
  subscribeWithSelector(
    immer(
      persist(
        (set, get) => ({
          fileList: [],
          baseFolder: null,
          isImporting: false,
          currentPage: 1,
          totalFiles: 0,
          importProgress: 0,
          isListLoading: false,
          selectedItems: [],
          isCompressing: false,
          isCompressionPaused: false,
          isCompressionCancelling: false,
          compressionProgress: 0,
          currentSorting: { column: 'filename', direction: 'ascending' },

          totalPages: () => Math.ceil(get().totalFiles / 50),

          openPickerDialogs: async (type: 'files' | 'folder') => {
            if (type === 'files') {
              await invokeBackend('open_import_files_dialog');
            } else {
              const recursive = useSettingsStore.getState().importSubfolderOnInput;
              await invokeBackend('open_import_folder_dialog', { recursive });
            }
          },
          setFileList: (files: CImage[]) => set({ fileList: files }),
          setBaseFolder: (folder: string) => set({ baseFolder: folder }),
          setIsImporting: (isImporting: boolean) => set({ isImporting }),
          setCurrentPage: (page: number) => set({ currentPage: page }),
          setTotalFiles: (totalFiles: number) => set({ totalFiles }),
          setImportProgress: (progress: number) => set({ importProgress: progress }),
          setIsListLoading: (isListLoading: boolean) => set({ isListLoading }),
          setSelectedItems: (items: CImage[]) => set({ selectedItems: items }),
          setIsCompressing: (isCompressing: boolean) => set({ isCompressing }),
          setIsCompressionCancelling: (isCompressionCancelling: boolean) => set({ isCompressionCancelling }),
          setIsCompressionPaused: (isCompressionPaused: boolean) => set({ isCompressionPaused }),
          setCompressionProgress: (progress: number) => set({ compressionProgress: progress }),
          setCurrentSorting: (sorting: SortDescriptor) => set({ currentSorting: sorting }),
          filterList: async (query: string) => {
            set({ isListLoading: true });
            invokeBackend<FileListPayload>('filter_list', { query })
              .then((payload) => {
                useFileListStore.getState().updateList(payload);
                useFileListStore.getState().setCurrentPage(1);
              })
              .finally(() => set({ isListLoading: false }));
          },
          updateList: (payload: FileListPayload) => {
            const { files, base_folder, total_files } = payload;
            useFileListStore.getState().setFileList(files);
            useFileListStore.getState().setBaseFolder(base_folder);
            useFileListStore.getState().setTotalFiles(total_files);
            useFileListStore.getState().setCurrentPage(Math.min(get().currentPage, Math.ceil(total_files / 50)));
          },
          invokeCompress: () => {
            if (get().isCompressing) {
              //TODO Return an error as this should never happen
              return;
            }
            set({ isCompressing: true });
            invokeBackend('compress', {
              options: {
                compression_options: useCompressionOptionsStore.getState().getCompressionOptions(),
                resize_options: useResizeOptionsStore.getState().getResizeOptions(),
                output_options: useOutputOptionsStore.getState().getOutputOptions(),
              },
              threads: useSettingsStore.getState().threadsCount,
              baseFolder: get().baseFolder,
            })
              .catch((e) => {
                console.error(e);
                //void error(e.message);
                // for (const id of ids) {
                //   useFileListStore.getState().updateFile(id, { status: IMAGE_STATUS.ERROR, info: e.toString() }); //TODO maybe we don't need to set all of them as errors
                // }
              })
              .finally(useFileListStore.getState().finishCompression);
          },
          updateFile: (id: string, updatedData: Partial<CImage>) =>
            set((state) => {
              const index = state.fileList.findIndex((file) => file.id === id);
              if (index !== -1) {
                state.fileList[index] = { ...state.fileList[index], ...updatedData };
              }
            }),
          invokePauseCompression: async () => {
            set({ isCompressionCancelling: true });
            await invokeBackend('pause_compression');
            //set({ isCompressionPaused: true, isCompressionCancelling: false });
          },
          invokeCancelCompression: async () => {
            set({ isCompressionCancelling: true, isCompressionPaused: false });
            await invokeBackend('cancel_compression');
          },
          invokeResumeCompression: async () => {
            await invokeBackend('resume_compression');
            set({ isCompressionPaused: false, isCompressionCancelling: false });
          },
          finishCompression: async () => {
            set({
              isCompressing: false,
              compressionProgress: 0,
              isCompressionPaused: false,
              isCompressionCancelling: false,
            });
            await execPostCompressionAction(useSettingsStore.getState().postCompressionAction);
          },
        }),
        {
          name: 'file-list-store',
          storage: createJSONStorage(() => sessionStorage),
          partialize: (state) =>
            Object.fromEntries(Object.entries(state).filter(([key]) => !['fileList'].includes(key))),
        },
      ),
    ),
  ),
);

// Subscribe to changes in currentPage to fetch new images
useFileListStore.subscribe(
  (state) => state.currentPage,
  async (currentPage: number) => {
    useFileListStore.getState().setIsListLoading(true);
    invokeBackend<FileListPayload>('change_page', { page: currentPage })
      .then((payload) => useFileListStore.getState().updateList(payload))
      .finally(() => useFileListStore.getState().setIsListLoading(false));
  },
);

useFileListStore.subscribe(
  (state) => state.fileList,
  async (fileList) => {
    if (fileList.length === 0) {
      useFileListStore.getState().setSelectedItems([]);
    }
  },
);
export default useFileListStore;
