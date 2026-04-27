import useFileListStore from '@/stores/file-list.store';
import { useDebounce } from './useDebounce';

export function useListLoading(delay = 500) {
  const { setIsListLoading } = useFileListStore();
  const [start, cancel] = useDebounce(() => setIsListLoading(true), delay);

  const stop = () => {
    cancel();
    setIsListLoading(false);
  };

  return { start, stop };
}
