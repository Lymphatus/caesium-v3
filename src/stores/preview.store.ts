import { CImage } from '@/types.ts';
import { create } from 'zustand/index';
import useFileListStore from '@/stores/file-list.store.ts';

interface PreviewStore {
  isLoading: boolean;
  currentPreviewedCImage: CImage | null;
  setIsLoading: (isLoading: boolean) => void;
  setCurrentPreviewedCImage: (cImage: CImage | null) => void;
}

const usePreviewStore = create<PreviewStore>()((set) => ({
  isLoading: false,
  currentPreviewedCImage: null,

  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setCurrentPreviewedCImage: (cImage: CImage | null) => set({ currentPreviewedCImage: cImage }),
}));

useFileListStore.subscribe(
  (state) => state.fileList,
  async (fileList) => {
    if (
      fileList.length === 0 ||
      fileList.find((cImage) => cImage.id === usePreviewStore.getState().currentPreviewedCImage?.id) === undefined
    ) {
      usePreviewStore.getState().setCurrentPreviewedCImage(null);
    }
  },
);

export default usePreviewStore;
