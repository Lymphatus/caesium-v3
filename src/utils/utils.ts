import { CompressionFinished, THEME } from '@/types.ts';
import { BaseDirectory, writeTextFile } from '@tauri-apps/plugin-fs';
import dayjs from 'dayjs';
import { getCurrentWindow } from '@tauri-apps/api/window';

export function range(start: number, stop: number, step: number) {
  return Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);
}

export function getSavedPercentage(oldSize: number, newSize: number) {
  if (oldSize === 0) return 0;
  return Math.round(((oldSize - newSize) / oldSize) * 100);
}

export function setDocumentTheme(theme: THEME) {
  if (theme === THEME.DARK) {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  } else if (theme === THEME.LIGHT) {
    window.document.documentElement.classList.remove('dark');
    window.document.documentElement.classList.add('light');
  }
}

export async function saveCompressionReport(report: CompressionFinished) {
  const now = dayjs().format('YYYY-MM-DD_HH-mm-ss');
  await writeTextFile(`compression_report_${now}.json`, JSON.stringify(report), {
    baseDir: BaseDirectory.AppLog,
  });
}

export function isInDevelopmentMode() {
  return import.meta.env.MODE === 'development';
}

export async function exitApplication() {
  // We have this delay because we need time to clear the preview panel before closing, due to a memory leak in macos
  setTimeout(async () => {
    await getCurrentWindow().destroy();
  }, 100);
}
