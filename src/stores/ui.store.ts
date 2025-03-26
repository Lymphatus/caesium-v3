import { create } from 'zustand/index';
import { immer } from 'zustand/middleware/immer';

interface SplitPanels {
  main: {
    left: number;
    right: number;
  };
  center: {
    top: number;
    bottom: number;
  };
}

interface UiOptions {
  splitPanels: SplitPanels;

  setSplitPanels: (options: Partial<SplitPanels>) => void;
}

const useUIStore = create<UiOptions>()(
  immer((set) => ({
    splitPanels: {
      main: {
        left: 70,
        right: 30,
      },
      center: {
        top: 60,
        bottom: 40,
      },
    },
    setSplitPanels: (options: Partial<SplitPanels>) =>
      set((state) => {
        Object.assign(state.splitPanels, options);
      }),
  })),
);

export default useUIStore;
