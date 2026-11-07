import { create } from 'zustand/index';
import { immer } from 'zustand/middleware/immer';
import { load } from '@tauri-apps/plugin-store';
import { SIDE_PANEL_TAB } from '@/types.ts';
import { subscribeWithSelector } from 'zustand/middleware';
import { path } from '@tauri-apps/api';
import { platform } from '@tauri-apps/plugin-os';
import { invokeBackend } from '@/utils/invoker.tsx';
import type { Layout } from 'react-resizable-panels';

interface PanelsLayout {
  main: Layout;
  center: Layout;
}

interface UIOptions {
  panelsLayout: PanelsLayout;
  jpegAccordionOpen: boolean;
  pngAccordionOpen: boolean;
  gifAccordionOpen: boolean;
  webpAccordionOpen: boolean;
  tiffAccordionOpen: boolean;
  currentSelectedTab: SIDE_PANEL_TAB;
  settingsDialogOpen: boolean;
  showPreviewPanel: boolean;
  autoPreview: boolean;
  showLabelsInToolbar: boolean;
  aboutDialogOpen: boolean;
  promptExitDialogOpen: boolean;
  checkForUpdatesDialogOpen: boolean;
  advancedImportDialogOpen: boolean;
  compressionProgressDialogMinimized: boolean;

  setPanelsLayout: (options: Partial<PanelsLayout>) => void;
  setJpegAccordionOpen: (open: boolean) => void;
  setPngAccordionOpen: (open: boolean) => void;
  setGifAccordionOpen: (open: boolean) => void;
  setWebpAccordionOpen: (open: boolean) => void;
  setTiffAccordionOpen: (open: boolean) => void;
  setCurrentSelectedTab: (tab: SIDE_PANEL_TAB) => void;
  setSettingsDialogOpen: (open: boolean) => void;
  setShowPreviewPanel: (show: boolean) => void;
  setAutoPreview: (autoPreview: boolean) => void;
  setShowLabelsInToolbar: (show: boolean) => void;
  setAboutDialogOpen: (open: boolean) => void;
  setPromptExitDialogOpen: (open: boolean) => void;
  setCheckForUpdatesDialogOpen: (open: boolean) => void;
  setAdvancedImportDialogOpen: (open: boolean) => void;
  setCompressionProgressDialogMinimized: (minimized: boolean) => void;
}

let configPath = 'settings.json';
if (platform() === 'windows') {
  const exeDir = await invokeBackend<string>('get_executable_dir');
  configPath = await path.join(exeDir, 'settings.json');
}

const settings = await load(configPath);
const preferences = (await settings.get('ui')) || {};

const defaultOptions = {
  panelsLayout: { main: { content: 70, side: 30 }, center: { list: 60, preview: 40 } },
  jpegAccordionOpen: true,
  pngAccordionOpen: true,
  gifAccordionOpen: true,
  webpAccordionOpen: true,
  tiffAccordionOpen: true,
  currentSelectedTab: SIDE_PANEL_TAB.COMPRESSION,
  settingsDialogOpen: false,
  showPreviewPanel: true,
  autoPreview: false,
  showLabelsInToolbar: false,
  aboutDialogOpen: false,
  promptExitDialogOpen: false,
  checkForUpdatesDialogOpen: false,
  advancedImportDialogOpen: false,
  compressionProgressDialogMinimized: false,
};

const useUIStore = create<UIOptions>()(
  subscribeWithSelector(
    immer((set) => ({
      ...defaultOptions,
      ...preferences,
      setPanelsLayout: (options: Partial<PanelsLayout>) =>
        set((state) => {
          Object.assign(state.panelsLayout, options);
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
      setGifAccordionOpen: (open: boolean) => {
        set((state) => {
          state.gifAccordionOpen = open;
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
      setShowPreviewPanel: (show: boolean) => {
        set((state) => {
          state.showPreviewPanel = show;
        });
      },
      setAutoPreview: (autoPreview: boolean) => {
        set((state) => {
          state.autoPreview = autoPreview;
        });
      },
      setShowLabelsInToolbar: (show: boolean) => {
        set((state) => {
          state.showLabelsInToolbar = show;
        });
      },

      setAboutDialogOpen: (open: boolean) => {
        set((state) => {
          state.aboutDialogOpen = open;
        });
      },

      setPromptExitDialogOpen: (open: boolean) => {
        set((state) => {
          state.promptExitDialogOpen = open;
        });
      },

      setCheckForUpdatesDialogOpen: (open: boolean) => {
        set((state) => {
          state.checkForUpdatesDialogOpen = open;
        });
      },

      setAdvancedImportDialogOpen: (open: boolean) => {
        set((state) => {
          state.advancedImportDialogOpen = open;
        });
      },

      setCompressionProgressDialogMinimized: (minimized: boolean) => {
        set((state) => {
          state.compressionProgressDialogMinimized = minimized;
        });
      },
    })),
  ),
);

useUIStore.subscribe(async (state) => {
  const dataToSave = {
    panelsLayout: state.panelsLayout,
    jpegAccordionOpen: state.jpegAccordionOpen,
    pngAccordionOpen: state.pngAccordionOpen,
    gifAccordionOpen: state.gifAccordionOpen,
    webpAccordionOpen: state.webpAccordionOpen,
    tiffAccordionOpen: state.tiffAccordionOpen,
    currentSelectedTab: state.currentSelectedTab,
    showPreviewPanel: state.showPreviewPanel,
    autoPreview: state.autoPreview,
    showLabelsInToolbar: state.showLabelsInToolbar,
  };

  await settings.set('ui', dataToSave);
});

export default useUIStore;
