import useAppStore from './app.store';
import useCompressionOptionsStore from './compression-options.store';
import useFileListStore from './file-list.store';
import useOutputOptionsStore from './output-options.store';
import usePreviewStore from './preview.store';
import useResizeOptionsStore from './resize-options.store';
import useSettingsStore from './settings.store';
import useUIStore from './ui.store';

export default {
  app: useAppStore,
  compressionOptions: useCompressionOptionsStore,
  fileList: useFileListStore,
  outputOptions: useOutputOptionsStore,
  preview: usePreviewStore,
  resizeOptions: useResizeOptionsStore,
  settings: useSettingsStore,
  ui: useUIStore,
};
