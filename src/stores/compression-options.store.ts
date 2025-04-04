import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CHROMA_SUBSAMPLING, TIFF_COMPRESSION_METHOD, TIFF_DEFLATE_LEVEL } from '@/types.ts';
import { subscribeWithSelector } from 'zustand/middleware';
import { load, Store } from '@tauri-apps/plugin-store';

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

interface CompressionOptionsStore {
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

const settings: Store = await load('settings.json', { autoSave: true });
const preferences = (await settings.get('compression_options.compression')) || {};

// Create store with default values first
const useCompressionOptionsStore = create<CompressionOptionsStore>()(
  subscribeWithSelector(
    immer((set) => ({
      ...defaultValues,
      ...preferences,
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
  ),
);

// Set up explicit subscription for saving state changes
useCompressionOptionsStore.subscribe(
  (state) => ({
    jpegOptions: state.jpegOptions,
    pngOptions: state.pngOptions,
    webpOptions: state.webpOptions,
    tiffOptions: state.tiffOptions,
    lossless: state.lossless,
    keepMetadata: state.keepMetadata,
    maxSize: state.maxSize,
    maxSizeUnit: state.maxSizeUnit,
  }),
  (data) => {
    settings
      .set('compression_options.compression', data)
      .then(() => {})
      .catch((error) => console.error('Error saving settings:', error));
  },
);

export default useCompressionOptionsStore;
