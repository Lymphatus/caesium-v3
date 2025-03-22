import { CImage } from '@/types.ts';
import { create } from 'zustand/index';

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

export default usePreviewStore;
