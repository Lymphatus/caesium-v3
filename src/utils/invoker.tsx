import { invoke, InvokeArgs } from '@tauri-apps/api/core';
import { toast } from 'sonner';
import i18next from 'i18next';

type ToastColor = 'danger' | 'warning' | 'success' | 'default' | 'foreground' | 'primary' | 'secondary';

interface InvokeOptions {
  errorMessage?: string;
  errorTitle?: string;
  rethrow?: boolean;
  color?: ToastColor;
}

function showToast(color: ToastColor, title: string, description: React.ReactNode) {
  switch (color) {
    case 'danger':
      toast.error(title, { description });
      break;
    case 'warning':
      toast.warning(title, { description });
      break;
    case 'success':
      toast.success(title, { description });
      break;
    default:
      toast(title, { description });
  }
}

export async function invokeBackend<T>(cmd: string, args?: InvokeArgs, options: InvokeOptions = {}): Promise<T> {
  try {
    return await invoke<T>(cmd, args);
  } catch (e: unknown) {
    const { errorMessage, errorTitle = i18next.t('errors.generic'), rethrow = true, color = 'danger' } = options;

    let description: React.ReactNode = (
      <>
        <p>{e as string}</p>
      </>
    );
    if (errorMessage) {
      description = <p>{errorMessage}</p>;
    }
    showToast(color, errorTitle, description);

    if (rethrow) {
      throw e;
    }

    return null as unknown as T;
  }
}
