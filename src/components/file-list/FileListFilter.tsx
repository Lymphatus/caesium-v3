import { Search } from 'lucide-react';
import { Input } from '@heroui/react';
import useFileListStore from '@/stores/file-list.store.ts';
import { useDebounce } from '@/hooks/useDebounce.ts';
import { useTranslation } from 'react-i18next';

const FileListFilter = () => {
  const { filterList } = useFileListStore();
  const { t } = useTranslation();
  const debouncedFilterList = useDebounce((v: string) => filterList(v), 500);

  return (
    <div>
      <Input
        isClearable
        classNames={{
          inputWrapper: 'shadow-none',
        }}
        label=""
        placeholder={t('file_list.search_help')}
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
