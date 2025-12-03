import { create } from 'zustand/index';
import { load } from '@tauri-apps/plugin-store';
import { subscribeWithSelector } from 'zustand/middleware';
import { path } from '@tauri-apps/api';
import { platform } from '@tauri-apps/plugin-os';
import { v4 as uuidv4 } from 'uuid';
import { invokeBackend } from '@/utils/invoker.tsx';
import { Update } from '@tauri-apps/plugin-updater';

interface AppOptionsStore {
  uuid: string;
  appUpdate: Update | null;

  setUuid: (uuid: string) => void;
  setAppUpdate: (isUpdateAvailable: Update | null) => void;
}

let configPath = 'settings.json';
if (platform() === 'windows') {
  const exeDir = await invokeBackend<string>('get_executable_dir');
  configPath = await path.join(exeDir, 'settings.json');
}

const settings = await load(configPath);
const preferences = (await settings.get('app')) || {};

const defaultOptions = {
  uuid: uuidv4(),
  appUpdate: null,
};

const useAppStore = create<AppOptionsStore>()(
  subscribeWithSelector((set) => ({
    ...defaultOptions,
    ...preferences,

    setUuid: (uuid: string) => set({ uuid }),
    setAppUpdate: (appUpdate: Update | null) => set({ appUpdate }),
  })),
);

await settings.set('app', {
  uuid: useAppStore.getState().uuid,
});
await settings.save();

export default useAppStore;
