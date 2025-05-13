import { POST_COMPRESSION_ACTION } from '@/types.ts';
import { getCurrentWindow } from '@tauri-apps/api/window';

export function execPostCompressionAction(postCompressionAction: POST_COMPRESSION_ACTION) {
  console.log('Post compression action: ', postCompressionAction);
  switch (postCompressionAction) {
    case POST_COMPRESSION_ACTION.CLOSE_APP:
      closeApp().catch((err) => console.error(err)); //TODO show a better error
      break;
    case POST_COMPRESSION_ACTION.SHUTDOWN:
      shutdown().catch((err) => console.log(err)); //TODO show a better error
      break;
    case POST_COMPRESSION_ACTION.SLEEP:
      sleep().catch((err) => console.log(err)); //TODO show a better error
      break;
    case POST_COMPRESSION_ACTION.OPEN_OUTPUT_FOLDER:
      openOutputFolder().catch((err) => console.log(err)); //TODO show a better error
      break;
    case POST_COMPRESSION_ACTION.NONE:
    default:
      break;
  }
}

async function closeApp() {
  await getCurrentWindow().destroy();
}

async function shutdown() {}
async function sleep() {}

async function openOutputFolder() {}
