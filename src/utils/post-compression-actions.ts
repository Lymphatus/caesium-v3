import { POST_COMPRESSION_ACTION } from '@/types.ts';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';
import useOutputOptionsStore from '@/stores/output-options.store.ts';

export function execPostCompressionAction(postCompressionAction: POST_COMPRESSION_ACTION) {
  if (postCompressionAction === POST_COMPRESSION_ACTION.CLOSE_APP) {
    closeApp().catch((err) => console.error(err)); //TODO show a better error
  } else if (postCompressionAction === POST_COMPRESSION_ACTION.SHUTDOWN) {
    shutdown().catch((err) => console.log(err)); //TODO show a better error
  } else if (postCompressionAction === POST_COMPRESSION_ACTION.SLEEP) {
    sleep().catch((err) => console.log(err)); //TODO show a better error
  } else if (postCompressionAction === POST_COMPRESSION_ACTION.OPEN_OUTPUT_FOLDER) {
    openOutputFolder().catch((err) => console.log(err)); //TODO show a better error
  }
}

async function closeApp() {
  await getCurrentWindow().destroy();
}

async function shutdown() {
  await invoke('exec_post_compression_action', {
    postCompressionAction: POST_COMPRESSION_ACTION.SHUTDOWN,
  });
}

async function sleep() {
  await invoke('exec_post_compression_action', {
    postCompressionAction: POST_COMPRESSION_ACTION.SLEEP,
  });
}

async function openOutputFolder() {
  await invoke('exec_post_compression_action', {
    postCompressionAction: POST_COMPRESSION_ACTION.OPEN_OUTPUT_FOLDER,
    payload: useOutputOptionsStore.getState().outputFolder,
  });
}
