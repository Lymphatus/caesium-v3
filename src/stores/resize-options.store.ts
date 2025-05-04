import { create } from 'zustand/index';
import { load } from '@tauri-apps/plugin-store';
import { RESIZE_MODE } from '@/types.ts';
import { invoke } from '@tauri-apps/api/core';
import { path } from '@tauri-apps/api';

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

  getResizeOptions: () => ResizeOptions;
}

interface ResizeOptions {
  resize_enabled: boolean;
  resize_mode: RESIZE_MODE;
  keep_aspect_ratio: boolean;
  do_not_enlarge: boolean;
  width: number;
  height: number;
  long_edge: number;
  short_edge: number;
}

const exeDir = await invoke<string>('get_executable_dir');
const settings = await load(await path.join(exeDir, 'settings.json'), { autoSave: true });
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

const useResizeOptionsStore = create<ResizeOptionsStore>()((set, get) => ({
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

  getResizeOptions: () => ({
    resize_enabled: get().resizeMode !== RESIZE_MODE.NONE,
    resize_mode: get().resizeMode,
    keep_aspect_ratio: get().keepAspectRatio,
    do_not_enlarge: get().doNotEnlarge,
    width: get().width,
    height: get().height,
    width_percentage: get().widthPercentage,
    height_percentage: get().heightPercentage,
    long_edge: get().dimension,
    short_edge: get().dimension,
  }),
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
