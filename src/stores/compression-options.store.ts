import { create } from 'zustand/index';
import { immer } from 'zustand/middleware/immer';
import { CHROMA_SUBSAMPLING } from '@/types.ts';

interface JpegOptions {
  quality: number;
  chromaSubsampling: CHROMA_SUBSAMPLING;
  progressive: boolean;
}

interface CompressionOptions {
  jpegOptions: JpegOptions;

  setJpegOptions: (options: Partial<JpegOptions>) => void;
}

const useCompressionOptionsStore = create<CompressionOptions>()(
  immer((set) => ({
    jpegOptions: {
      quality: 80,
      chromaSubsampling: CHROMA_SUBSAMPLING.AUTO,
      progressive: true,
    },
    setJpegOptions: (options: Partial<JpegOptions>) =>
      set((state) => {
        Object.assign(state.jpegOptions, options);
      }),
  })),
);

export default useCompressionOptionsStore;
