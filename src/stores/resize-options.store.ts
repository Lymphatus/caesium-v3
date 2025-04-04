import { create } from 'zustand/index';
import { load } from '@tauri-apps/plugin-store';
import { RESIZE_MODE } from '@/types.ts';

interface ResizeOptionsStore {
  resizeMode: RESIZE_MODE;
  width: number;
  height: number;
  widthPercentage: number;
  heightPercentage: number;
  dimension: number;
  keepAspectRatio: boolean;
  doNotEnlarge: boolean;

  setResizeMode: (resizeMode: RESIZE_MODE) => void;
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setWidthPercentage: (widthPercentage: number) => void;
  setHeightPercentage: (heightPercentage: number) => void;
  setDimension: (dimension: number) => void;
  setKeepAspectRatio: (keepAspectRatio: boolean) => void;
  setDoNotEnlarge: (doNotEnlarge: boolean) => void;
}

const settings = await load('settings.json', { autoSave: true });
const preferences = (await settings.get('compression_options.resize')) || {};

const defaultOptions = {
  resizeMode: RESIZE_MODE.NONE,
  width: 500,
  height: 500,
  heightPercentage: 100,
  widthPercentage: 100,
  dimension: 500,
  keepAspectRatio: true,
  doNotEnlarge: true,
};

const useResizeOptionsStore = create<ResizeOptionsStore>()((set) => ({
  ...defaultOptions,
  ...preferences,

  setResizeMode: (resizeMode: RESIZE_MODE) => set({ resizeMode }),
  setWidth: (width: number) => set({ width }),
  setHeight: (height: number) => set({ height }),
  setWidthPercentage: (widthPercentage: number) => set({ widthPercentage }),
  setHeightPercentage: (heightPercentage: number) => set({ heightPercentage }),
  setDimension: (dimension: number) => set({ dimension }),
  setKeepAspectRatio: (keepAspectRatio: boolean) => set({ keepAspectRatio }),
  setDoNotEnlarge: (doNotEnlarge: boolean) => set({ doNotEnlarge }),
}));

useResizeOptionsStore.subscribe((state) => {
  // Extract only the data part without the functions
  const dataToSave = {
    resizeMode: state.resizeMode,
    width: state.width,
    height: state.height,
    widthPercentage: state.widthPercentage,
    heightPercentage: state.heightPercentage,
    dimension: state.dimension,
    keepAspectRatio: state.keepAspectRatio,
    doNotEnlarge: state.doNotEnlarge,
  };

  // Save to Tauri store
  settings
    .set('compression_options.resize', dataToSave)
    .then(() => {})
    .catch(console.error);
});

export default useResizeOptionsStore;
