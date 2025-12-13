import { CompressionFinished, THEME } from '@/types.ts';
import { BaseDirectory, writeTextFile } from '@tauri-apps/plugin-fs';
import dayjs from 'dayjs';

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
