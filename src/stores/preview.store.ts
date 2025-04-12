import { CImage } from '@/types.ts';
import { create } from 'zustand/index';
import useFileListStore from '@/stores/file-list.store.ts';

interface PreviewStore {
  isLoading: boolean;
  currentPreviewedCImage: CImage | null;
  visualizationMode: 'original' | 'compressed';

  setIsLoading: (isLoading: boolean) => void;
  setCurrentPreviewedCImage: (cImage: CImage | null) => void;
  setVisualizationMode: (visualizationMode: 'original' | 'compressed') => void;

  getCurrentPreviewedCImage: () => CImage | null;
}

const usePreviewStore = create<PreviewStore>()((set, get) => ({
  isLoading: false,
  currentPreviewedCImage: null,
  visualizationMode: 'original',

  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setCurrentPreviewedCImage: (cImage: CImage | null) => set({ currentPreviewedCImage: cImage }),
  setVisualizationMode: (visualizationMode: 'original' | 'compressed') => set({ visualizationMode }),

  getCurrentPreviewedCImage: () => get().currentPreviewedCImage,
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
