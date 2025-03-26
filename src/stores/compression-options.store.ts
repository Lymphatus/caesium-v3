import { create } from 'zustand/index';
import { immer } from 'zustand/middleware/immer';
import { CHROMA_SUBSAMPLING, TIFF_COMPRESSION_METHOD, TIFF_DEFLATE_LEVEL } from '@/types.ts';

interface JpegOptions {
  quality: number;
  chromaSubsampling: CHROMA_SUBSAMPLING;
  progressive: boolean;
}

interface PngOptions {
  quality: number;
  optimizationLevel: number;
}

interface WebpOptions {
  quality: number;
}

interface TiffOptions {
  method: TIFF_COMPRESSION_METHOD;
  deflateLevel: TIFF_DEFLATE_LEVEL;
}

interface CompressionOptions {
  jpegOptions: JpegOptions;
  pngOptions: PngOptions;
  webpOptions: WebpOptions;
  tiffOptions: TiffOptions;
  lossless: boolean;
  keepMetadata: boolean;
  maxSize: number;
  maxSizeUnit: number;

  setJpegOptions: (options: Partial<JpegOptions>) => void;
  setPngOptions: (options: Partial<PngOptions>) => void;
  setWebpOptions: (options: Partial<WebpOptions>) => void;
  setTiffOptions: (options: Partial<TiffOptions>) => void;
  setLossless: (lossless: boolean) => void;
  setKeepMetadata: (keepMetadata: boolean) => void;
  setMaxSize: (maxSize: number) => void;
  setMaxSizeUnit: (maxSizeUnit: number) => void;
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
  webpOptions: {
    quality: 80,
  },
  tiffOptions: {
    method: TIFF_COMPRESSION_METHOD.DEFLATE,
    deflateLevel: TIFF_DEFLATE_LEVEL.BALANCED,
  },
  maxSize: 500,
  maxSizeUnit: 1024,
  lossless: false,
  keepMetadata: true,
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
    setWebpOptions: (options: Partial<WebpOptions>) =>
      set((state) => {
        Object.assign(state.webpOptions, options);
      }),
    setTiffOptions: (options: Partial<TiffOptions>) =>
      set((state) => {
        Object.assign(state.tiffOptions, options);
      }),
    setLossless: (lossless: boolean) =>
      set((state) => {
        state.lossless = lossless;
      }),
    setKeepMetadata: (keepMetadata: boolean) =>
      set((state) => {
        state.keepMetadata = keepMetadata;
      }),
    setMaxSize: (maxSize: number) =>
      set((state) => {
        state.maxSize = maxSize;
      }),
    setMaxSizeUnit: (maxSizeUnit: number) =>
      set((state) => {
        state.maxSizeUnit = maxSizeUnit;
      }),
  })),
);

export default useCompressionOptionsStore;
