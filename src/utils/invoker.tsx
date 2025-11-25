import { invoke, InvokeArgs } from '@tauri-apps/api/core';
import { addToast } from '@heroui/react';
import i18next from 'i18next';

interface InvokeOptions {
  errorMessage?: string;
  errorTitle?: string;
  rethrow?: boolean;
  color?: 'danger' | 'warning' | 'success' | 'default' | 'foreground' | 'primary' | 'secondary';
}

export async function invokeBackend<T>(cmd: string, args?: InvokeArgs, options: InvokeOptions = {}): Promise<T> {
  try {
    return await invoke<T>(cmd, args);
  } catch (e: unknown) {
    const { errorMessage, errorTitle = i18next.t('errors.generic'), rethrow = true, color = 'danger' } = options;

    let description = (
      <>
        <p>{e as string}</p>
      </>
    );
    if (errorMessage) {
      description = <p>{errorMessage}</p>;
    }
    addToast({
      title: errorTitle,
      description,
      color,
    });

    if (rethrow) {
      throw e;
    }

    return null as unknown as T;
  }
}
