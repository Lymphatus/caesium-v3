import { THEME } from '@/types.ts';

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
