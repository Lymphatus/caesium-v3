import { create } from 'zustand/index';
import { immer } from 'zustand/middleware/immer';
import { load } from '@tauri-apps/plugin-store';

interface SplitPanels {
  main: number[];
  center: number[];
}

interface UIOptions {
  splitPanels: SplitPanels;
  jpegAccordionOpen: boolean;
  pngAccordionOpen: boolean;
  webpAccordionOpen: boolean;
  tiffAccordionOpen: boolean;

  setSplitPanels: (options: Partial<SplitPanels>) => void;
  setJpegAccordionOpen: (open: boolean) => void;
  setPngAccordionOpen: (open: boolean) => void;
  setWebpAccordionOpen: (open: boolean) => void;
  setTiffAccordionOpen: (open: boolean) => void;
}

const settings = await load('settings.json', { autoSave: true });
const preferences = (await settings.get('ui_options')) as UIOptions;

const defaultOptions = {
  splitPanels: { main: [70, 30], center: [60, 40] },
  jpegAccordionOpen: true,
  pngAccordionOpen: true,
  webpAccordionOpen: true,
  tiffAccordionOpen: true,
};

const useUIStore = create<UIOptions>()(
  immer((set) => ({
    ...defaultOptions,
    ...preferences,
    setSplitPanels: (options: Partial<SplitPanels>) =>
      set((state) => {
        Object.assign(state.splitPanels, options);
      }),

    setJpegAccordionOpen: (open: boolean) => {
      set((state) => {
        state.jpegAccordionOpen = open;
      });
    },
    setPngAccordionOpen: (open: boolean) => {
      set((state) => {
        state.pngAccordionOpen = open;
      });
    },
    setWebpAccordionOpen: (open: boolean) => {
      set((state) => {
        state.webpAccordionOpen = open;
      });
    },
    setTiffAccordionOpen: (open: boolean) => {
      set((state) => {
        state.tiffAccordionOpen = open;
      });
    },
  })),
);

// Subscribe to store changes and persist them
useUIStore.subscribe((state) => {
  // Extract only the data part without the functions
  const dataToSave = {
    splitPanels: state.splitPanels,
    jpegAccordionOpen: state.jpegAccordionOpen,
    pngAccordionOpen: state.pngAccordionOpen,
    webpAccordionOpen: state.webpAccordionOpen,
    tiffAccordionOpen: state.tiffAccordionOpen,
  };

  // Save to Tauri store
  settings
    .set('ui_options', dataToSave)
    .then(() => {})
    .catch(console.error);
});

export default useUIStore;
