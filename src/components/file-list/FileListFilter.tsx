import { Search } from 'lucide-react';
import { Input } from '@heroui/react';
import useFileListStore from '@/stores/file-list.store.ts';
import { useDebounce } from '@/hooks/useDebounce.ts';

const FileListFilter = () => {
  const { filterList } = useFileListStore();

  const debouncedFilterList = useDebounce((v: string) => filterList(v), 500);

  return (
    <div>
      <Input
        isClearable
        classNames={{
          inputWrapper: 'shadow-none',
        }}
        label=""
        size="sm"
        startContent={<Search className="size-4" />}
        type="text"
        variant="faded"
        onValueChange={(v) => debouncedFilterList(v)}
      />
    </div>
  );
};

export default FileListFilter;
