import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CHROMA_SUBSAMPLING, COMPRESSION_MODE, TIFF_COMPRESSION_METHOD, TIFF_DEFLATE_LEVEL } from '@/types.ts';
import { subscribeWithSelector } from 'zustand/middleware';
import { load } from '@tauri-apps/plugin-store';
import { invoke } from '@tauri-apps/api/core';
import { path } from '@tauri-apps/api';
import { platform } from '@tauri-apps/plugin-os';

interface JpegOptions {
  quality: number;
  chromaSubsampling: CHROMA_SUBSAMPLING;
  progressive: boolean;
  optimize: boolean;
}

interface PngOptions {
  quality: number;
  optimizationLevel: number;
  optimize: boolean;
}

interface GifOptions {
  quality: number;
}

interface WebpOptions {
  quality: number;
  lossless: boolean;
}

interface TiffOptions {
  method: TIFF_COMPRESSION_METHOD;
  deflateLevel: TIFF_DEFLATE_LEVEL;
}

export interface CompressionOptions {
  jpeg: {
    quality: number;
    chroma_subsampling: CHROMA_SUBSAMPLING;
    progressive: boolean;
    optimize: boolean;
  };
  png: {
    quality: number;
    optimization_level: number;
    optimize: boolean;
  };
  gif: {
    quality: number;
  };
  webp: {
    quality: number;
    lossless: boolean;
  };
  tiff: {
    method: TIFF_COMPRESSION_METHOD;
    deflate_level: TIFF_DEFLATE_LEVEL;
  };
  compression_mode: COMPRESSION_MODE;
  keep_metadata: boolean;
  max_size_value: number;
  max_size_unit: number;
}

export interface StoredCompressionOptions {
  jpegOptions: {
    quality: number;
    chromaSubsampling: CHROMA_SUBSAMPLING;
    progressive: boolean;
    optimize: boolean;
  };
  pngOptions: {
    quality: number;
    optimizationLevel: number;
    optimize: boolean;
  };
  gifOptions: {
    quality: number;
  };
  webpOptions: {
    quality: number;
    lossless: boolean;
  };
  tiffOptions: {
    method: TIFF_COMPRESSION_METHOD;
    deflateLevel: TIFF_DEFLATE_LEVEL;
  };
  maxSize: number;
  maxSizeUnit: number;
  lossless: boolean;
  keepMetadata: boolean;
}

interface CompressionOptionsStore {
  jpegOptions: JpegOptions;
  pngOptions: PngOptions;
  gifOptions: GifOptions;
  webpOptions: WebpOptions;
  tiffOptions: TiffOptions;
  keepMetadata: boolean;
  maxSize: number;
  maxSizeUnit: number;

  setJpegOptions: (options: Partial<JpegOptions>) => void;
  setPngOptions: (options: Partial<PngOptions>) => void;
  setGifOptions: (options: Partial<GifOptions>) => void;
  setWebpOptions: (options: Partial<WebpOptions>) => void;
  setTiffOptions: (options: Partial<TiffOptions>) => void;
  setKeepMetadata: (keepMetadata: boolean) => void;
  setMaxSize: (maxSize: number) => void;
  setMaxSizeUnit: (maxSizeUnit: number) => void;

  getCompressionOptions: () => CompressionOptions;
}

const defaultValues: StoredCompressionOptions = {
  jpegOptions: {
    quality: 80,
    chromaSubsampling: CHROMA_SUBSAMPLING.AUTO,
    progressive: true,
    optimize: false,
  },
  pngOptions: {
    quality: 80,
    optimizationLevel: 3,
    optimize: false,
  },
  gifOptions: {
    quality: 80,
  },
  webpOptions: {
    quality: 80,
    lossless: false,
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

let configPath = 'settings.json';
if (platform() === 'windows') {
  const exeDir = await invoke<string>('get_executable_dir');
  configPath = await path.join(exeDir, 'settings.json');
}

const settings = await load(configPath);
const preferences: StoredCompressionOptions =
  ((await settings.get('compression_options.compression')) as StoredCompressionOptions) || defaultValues;

// Create store with default values first
const useCompressionOptionsStore = create<CompressionOptionsStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...defaultValues,
      jpegOptions: { ...defaultValues.jpegOptions, ...preferences.jpegOptions },
      pngOptions: { ...defaultValues.pngOptions, ...preferences.pngOptions },
      gifOptions: { ...defaultValues.gifOptions, ...preferences.gifOptions },
      webpOptions: { ...defaultValues.webpOptions, ...preferences.webpOptions },
      tiffOptions: { ...defaultValues.tiffOptions, ...preferences.tiffOptions },
      setJpegOptions: (options: Partial<JpegOptions>) =>
        set((state) => {
          Object.assign(state.jpegOptions, options);
        }),
      setPngOptions: (options: Partial<PngOptions>) =>
        set((state) => {
          Object.assign(state.pngOptions, options);
        }),
      setGifOptions: (options: Partial<GifOptions>) =>
        set((state) => {
          Object.assign(state.gifOptions, options);
        }),
      setWebpOptions: (options: Partial<WebpOptions>) =>
        set((state) => {
          Object.assign(state.webpOptions, options);
        }),
      setTiffOptions: (options: Partial<TiffOptions>) =>
        set((state) => {
          Object.assign(state.tiffOptions, options);
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
      getCompressionOptions: () => ({
        jpeg: {
          quality: get().jpegOptions.quality,
          chroma_subsampling: get().jpegOptions.chromaSubsampling,
          progressive: get().jpegOptions.progressive,
          optimize: get().jpegOptions.optimize,
        },
        png: {
          quality: get().pngOptions.quality,
          optimization_level: get().pngOptions.optimizationLevel,
          optimize: get().pngOptions.optimize,
        },
        gif: {
          quality: get().gifOptions.quality,
        },
        webp: {
          quality: get().webpOptions.quality,
          lossless: get().webpOptions.lossless,
        },
        tiff: {
          method: get().tiffOptions.method,
          deflate_level: get().tiffOptions.deflateLevel,
        },
        compression_mode: COMPRESSION_MODE.QUALITY, //TODO needs a variable
        keep_metadata: get().keepMetadata,
        max_size_value: get().maxSize,
        max_size_unit: get().maxSizeUnit,
      }),
    })),
  ),
);

useCompressionOptionsStore.subscribe(
  (state) => ({
    jpegOptions: state.jpegOptions,
    pngOptions: state.pngOptions,
    gifOptions: state.gifOptions,
    webpOptions: state.webpOptions,
    tiffOptions: state.tiffOptions,
    keepMetadata: state.keepMetadata,
    maxSize: state.maxSize,
    maxSizeUnit: state.maxSizeUnit,
  }),
  async (data) => {
    await settings.set('compression_options.compression', data);
  },
);

export default useCompressionOptionsStore;
