import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import useFileListStore from '@/stores/file-list.store.ts';
import { useDebounce } from '@/hooks/useDebounce.ts';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const FileListFilter = () => {
  const [query, setQuery] = useState('');
  const { filterList, totalFiles } = useFileListStore();
  const { t } = useTranslation();
  const [debouncedFilterList] = useDebounce((v: string) => filterList(v), 500);

  return (
    <div className="relative flex w-full items-center">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        className="pl-9"
        disabled={totalFiles === 0 && query.length === 0}
        placeholder={t('file_list.search_help')}
        size="sm"
        type="text"
        onChange={(e) => {
          setQuery(e.target.value);
          debouncedFilterList(e.target.value);
        }}
      />
    </div>
  );
};

export default FileListFilter;
