import { create } from 'zustand/index';
import { load } from '@tauri-apps/plugin-store';
import { DIRECT_IMPORT_ACTION, POST_COMPRESSION_ACTION, THEME } from '@/types.ts';
import { subscribeWithSelector } from 'zustand/middleware';
import { app, path } from '@tauri-apps/api';
import { invoke } from '@tauri-apps/api/core';

interface SettingsOptionsStore {
  theme: THEME;
  language: string;
  checkUpdatesAtStartup: boolean;
  promptBeforeExit: boolean;
  skipMessagesAndDialogs: boolean;
  sendUsageData: boolean;
  importSubfolderOnInput: boolean;
  directImportAction: DIRECT_IMPORT_ACTION;
  postCompressionAction: POST_COMPRESSION_ACTION;
  threadsCount: number;
  threadsPriority: number;

  setTheme: (theme: THEME) => void;
  setLanguage: (language: string) => void;
  setCheckUpdatesAtStartup: (checkUpdatesAtStartup: boolean) => void;
  setPromptBeforeExit: (promptBeforeExit: boolean) => void;
  setSkipMessagesAndDialogs: (skipMessagesAndDialogs: boolean) => void;
  setSendUsageData: (sendUsageData: boolean) => void;
  setImportSubfolderOnInput: (importSubfolderOnInput: boolean) => void;
  setDirectImportAction: (directImportAction: DIRECT_IMPORT_ACTION) => void;
  setPostCompressionAction: (postCompressionAction: POST_COMPRESSION_ACTION) => void;
  setThreadsCount: (threadsCount: number) => void;
  setThreadsPriority: (threadsPriority: number) => void;
}

const exeDir = await invoke<string>('get_executable_dir');
const settings = await load(await path.join(exeDir, 'settings.json'), { autoSave: true });
const preferences = (await settings.get('settings')) || {};

const defaultOptions = {
  theme: THEME.SYSTEM,
  language: 'en', // TODO
  checkUpdatesAtStartup: true,
  promptBeforeExit: false,
  skipMessagesAndDialogs: false,
  sendUsageData: true,
  importSubfolderOnInput: true,
  directImportAction: DIRECT_IMPORT_ACTION.IMPORT,
  postCompressionAction: POST_COMPRESSION_ACTION.NONE,
  threadsCount: navigator.hardwareConcurrency || 2, //TODO on safari this is limited
  threadsPriority: 4,
};

const useSettingsStore = create<SettingsOptionsStore>()(
  subscribeWithSelector((set) => ({
    ...defaultOptions,
    ...preferences,
    setTheme: (theme: THEME) => set({ theme }),
    setLanguage: (language: string) => set({ language }),
    setCheckUpdatesAtStartup: (checkUpdatesAtStartup: boolean) => set({ checkUpdatesAtStartup }),
    setPromptBeforeExit: (promptBeforeExit: boolean) => set({ promptBeforeExit }),
    setSkipMessagesAndDialogs: (skipMessagesAndDialogs: boolean) => set({ skipMessagesAndDialogs }),
    setSendUsageData: (sendUsageData: boolean) => set({ sendUsageData }),
    setImportSubfolderOnInput: (importSubfolderOnInput: boolean) => set({ importSubfolderOnInput }),
    setDirectImportAction: (directImportAction: DIRECT_IMPORT_ACTION) => set({ directImportAction }),
    setPostCompressionAction: (postCompressionAction: POST_COMPRESSION_ACTION) => set({ postCompressionAction }),
    setThreadsCount: (threadsCount: number) => set({ threadsCount }),
    setThreadsPriority: (threadsPriority: number) => set({ threadsPriority }),
  })),
);

useSettingsStore.subscribe((state) => {
  // Extract only the data part without the functions
  const dataToSave = {
    theme: state.theme,
    language: state.language,
    checkUpdatesAtStartup: state.checkUpdatesAtStartup,
    promptBeforeExit: state.promptBeforeExit,
    skipMessagesAndDialogs: state.skipMessagesAndDialogs,
    sendUsageData: state.sendUsageData,
    importSubfolderOnInput: state.importSubfolderOnInput,
    directImportAction: state.directImportAction,
    postCompressionAction: state.postCompressionAction,
    threadsCount: state.threadsCount,
    threadsPriority: state.threadsPriority,
  };

  // Save to Tauri store
  settings
    .set('settings', dataToSave)
    .then(() => console.log('Saved to Tauri store'))
    .catch(console.error);
});

useSettingsStore.subscribe(
  (state) => state.theme,
  async (theme: THEME) => {
    if (
      theme === THEME.LIGHT ||
      (theme === THEME.SYSTEM && !window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      window.document.documentElement.classList.add('light');
      window.document.documentElement.classList.remove('dark');
      await app.setTheme('light');
    } else if (
      theme === THEME.DARK ||
      (theme === THEME.SYSTEM && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      window.document.documentElement.classList.add('dark');
      window.document.documentElement.classList.remove('light');
      await app.setTheme('dark');
    }
  },
);

export default useSettingsStore;
