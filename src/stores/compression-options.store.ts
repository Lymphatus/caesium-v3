import { create } from 'zustand/index';
import { immer } from 'zustand/middleware/immer';
import { CHROMA_SUBSAMPLING } from '@/types.ts';

interface JpegOptions {
  quality: number;
  chromaSubsampling: CHROMA_SUBSAMPLING;
  progressive: boolean;
}

interface PngOptions {
  quality: number;
  optimizationLevel: number;
}

interface CompressionOptions {
  jpegOptions: JpegOptions;
  pngOptions: PngOptions;

  setJpegOptions: (options: Partial<JpegOptions>) => void;
  setPngOptions: (options: Partial<PngOptions>) => void;
}

const defaultValues = {
  jpegOptions: {
    quality: 80,
    chromaSubsampling: CHROMA_SUBSAMPLING.AUTO,
    progressive: true,
  },
  pngOptions: {
    quality: 80,
    optimizationLevel: 3,
  },
};

const useCompressionOptionsStore = create<CompressionOptions>()(
  immer((set) => ({
    ...defaultValues,
    setJpegOptions: (options: Partial<JpegOptions>) =>
      set((state) => {
        Object.assign(state.jpegOptions, options);
      }),
    setPngOptions: (options: Partial<PngOptions>) =>
      set((state) => {
        Object.assign(state.pngOptions, options);
      }),
  })),
);

export default useCompressionOptionsStore;
