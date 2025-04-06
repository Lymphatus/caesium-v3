import { create } from 'zustand/index';
import { immer } from 'zustand/middleware/immer';
import { load } from '@tauri-apps/plugin-store';
import { SIDE_PANEL_TAB } from '@/types.ts';

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
  currentSelectedTab: SIDE_PANEL_TAB;
  settingsDialogOpen: boolean;

  setSplitPanels: (options: Partial<SplitPanels>) => void;
  setJpegAccordionOpen: (open: boolean) => void;
  setPngAccordionOpen: (open: boolean) => void;
  setWebpAccordionOpen: (open: boolean) => void;
  setTiffAccordionOpen: (open: boolean) => void;
  setCurrentSelectedTab: (tab: SIDE_PANEL_TAB) => void;
  setSettingsDialogOpen: (open: boolean) => void;
}

const settings = await load('settings.json', { autoSave: true });
const preferences = (await settings.get('ui')) || {};

const defaultOptions = {
  splitPanels: { main: [70, 30], center: [60, 40] },
  jpegAccordionOpen: true,
  pngAccordionOpen: true,
  webpAccordionOpen: true,
  tiffAccordionOpen: true,
  currentSelectedTab: SIDE_PANEL_TAB.COMPRESSION,
  settingsDialogOpen: false,
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
    setCurrentSelectedTab: (tab: SIDE_PANEL_TAB) => {
      set((state) => {
        state.currentSelectedTab = tab;
      });
    },
    setSettingsDialogOpen: (open: boolean) => {
      set((state) => {
        state.settingsDialogOpen = open;
      });
    },
  })),
);

useUIStore.subscribe((state) => {
  // Extract only the data part without the functions
  const dataToSave = {
    splitPanels: state.splitPanels,
    jpegAccordionOpen: state.jpegAccordionOpen,
    pngAccordionOpen: state.pngAccordionOpen,
    webpAccordionOpen: state.webpAccordionOpen,
    tiffAccordionOpen: state.tiffAccordionOpen,
    currentSelectedTab: state.currentSelectedTab,
  };

  // Save to Tauri store
  settings
    .set('ui', dataToSave)
    .then(() => {})
    .catch(console.error);
});

export default useUIStore;
