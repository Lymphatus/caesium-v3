import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import useFileListStore from '@/stores/file-list.store.ts';
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  Circle,
  CircleAlert,
  CircleCheck,
  CircleX,
  Search,
  X,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import prettyBytes from 'pretty-bytes';
import usePreviewStore from '@/stores/preview.store.ts';
import { useTranslation } from 'react-i18next';
import { sep } from '@tauri-apps/api/path';
import { CImage, FileListPayload, IMAGE_STATUS } from '@/types.ts';
import { invokeBackend } from '@/utils/invoker.tsx';
import { SavedLabel } from '@/components/SavedLabel.tsx';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { cn } from '@/lib/utils';

function getSubpart(baseFolder: string | null, fullPath: string, filename: string) {
  if (baseFolder == null) {
    return '';
  }
  const separator = sep();
  if (baseFolder.length === 0) {
    return fullPath.replace(filename, '');
  }
  return fullPath.replace(baseFolder + separator, '').replace(filename, '');
}

function StatusIcon({ cImage }: { cImage: CImage }) {
  if (cImage.status === IMAGE_STATUS.SUCCESS) {
    return <CircleCheck className="text-success size-4" />;
  } else if (cImage.status === IMAGE_STATUS.ERROR) {
    return <CircleX className="text-destructive size-4" />;
  } else if (cImage.status === IMAGE_STATUS.WARNING) {
    return <CircleAlert className="text-warning size-4" />;
  } else if (cImage.status === IMAGE_STATUS.COMPRESSING) {
    return <Spinner className="text-primary size-4" />;
  }
  return <Circle className="text-primary size-4" />;
}

type SortableColumn = 'filename' | 'size' | 'resolution' | 'saved';

function FileListTable() {
  const {
    fileList,
    isListLoading,
    baseFolder,
    setSelectedItems,
    selectedItems,
    setCurrentSorting,
    currentSorting,
    setIsListLoading,
    updateList,
    isCompressing,
  } = useFileListStore();
  const { setCurrentPreviewedCImage, invokePreview, currentPreviewedCImage } = usePreviewStore();
  const { t } = useTranslation();

  const handleSort = (column: SortableColumn) => {
    const direction =
      currentSorting.column === column && currentSorting.direction === 'ascending' ? 'descending' : 'ascending';
    setIsListLoading(true);
    setCurrentSorting({ column, direction });
    invokeBackend<FileListPayload>('sort_list', { column, order: direction })
      .then((payload) => updateList(payload))
      .finally(() => setIsListLoading(false));
  };

  const SortableHead = ({ column, label }: { column: SortableColumn; label: string }) => {
    const isSorted = currentSorting.column === column;
    return (
      <TableHead>
        <button
          className="hover:text-foreground flex items-center gap-1"
          type="button"
          onClick={() => handleSort(column)}
        >
          {label}
          {!isSorted && <ChevronsUpDown className="size-3 opacity-50" />}
          {isSorted && currentSorting.direction === 'ascending' && <ChevronUp className="size-3" />}
          {isSorted && currentSorting.direction === 'descending' && <ChevronDown className="size-3" />}
        </button>
      </TableHead>
    );
  };

  const allSelected = fileList.length > 0 && selectedItems.length === fileList.length;
  const someSelected = selectedItems.length > 0 && !allSelected;

  const toggleAll = (checked: boolean | 'indeterminate') => {
    setSelectedItems(checked === true ? [...fileList] : []);
  };

  const toggleRow = (cImage: CImage, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedItems([...selectedItems, cImage]);
    } else {
      setSelectedItems(selectedItems.filter((s) => s.id !== cImage.id));
    }
  };

  return (
    <div className="relative size-full">
      {isListLoading && (
        <div className="bg-background/70 absolute z-20 flex size-full items-center justify-center">
          <Spinner className="text-primary size-10" />
        </div>
      )}
      <Table>
        <TableHeader className="bg-background sticky top-0 z-10">
          <TableRow>
            <TableHead className="w-[40px] text-center">
              <Checkbox
                aria-label="Select all"
                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                onCheckedChange={toggleAll}
              />
            </TableHead>
            <TableHead className="w-[40px] text-center" />
            <SortableHead column="filename" label={t('file_list.filename')} />
            <SortableHead column="size" label={t('file_list.size')} />
            <SortableHead column="resolution" label={t('file_list.resolution')} />
            <SortableHead column="saved" label={t('file_list.saved')} />
            <TableHead>{t('file_list.additional_info')}</TableHead>
            <TableHead className="w-[80px]">{t('file_list.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fileList.map((cImage) => {
            const isSelected = selectedItems.some((s) => s.id === cImage.id);
            const sizeChanged = cImage.compressed_size !== 0 && cImage.size !== cImage.compressed_size;
            const resolutionChanged =
              cImage.compressed_width !== 0 &&
              cImage.compressed_height !== 0 &&
              (cImage.compressed_width !== cImage.width || cImage.compressed_height !== cImage.height);
            const isPreviewed = cImage.id === currentPreviewedCImage?.id;
            return (
              <TableRow
                key={cImage.id}
                className={cn('cursor-pointer', isPreviewed && 'bg-muted')}
                data-state={isSelected ? 'selected' : undefined}
                onClick={() => setCurrentPreviewedCImage(cImage)}
              >
                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    aria-label={`Select ${cImage.name}`}
                    checked={isSelected}
                    onCheckedChange={(v) => toggleRow(cImage, v)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <StatusIcon cImage={cImage} />
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-nowrap">
                    <small className="text-muted-foreground">{getSubpart(baseFolder, cImage.path, cImage.name)}</small>
                    <span>{cImage.name}</span>
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-nowrap items-center gap-1">
                    <span className={cn('text-nowrap', sizeChanged && 'text-muted-foreground line-through')}>
                      {prettyBytes(cImage.size)}
                    </span>
                    {sizeChanged && <span className="text-nowrap">{prettyBytes(cImage.compressed_size)}</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-nowrap items-center gap-1">
                    <span className={cn('text-nowrap', resolutionChanged && 'text-muted-foreground line-through')}>
                      {`${cImage.width}x${cImage.height}`}
                    </span>
                    {resolutionChanged && (
                      <span className="text-nowrap">{`${cImage.compressed_width}x${cImage.compressed_height}`}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <SavedLabel cImage={cImage} />
                </TableCell>
                <TableCell>
                  <span className="text-nowrap">{cImage.info}</span>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between gap-1">
                    <Button
                      disabled={cImage.status === IMAGE_STATUS.COMPRESSING || isCompressing}
                      size="icon-xs"
                      title={t('actions.preview')}
                      variant="ghost"
                      onClick={() => invokePreview([cImage.id])}
                    >
                      <Search />
                    </Button>
                    <Button
                      disabled={cImage.status === IMAGE_STATUS.COMPRESSING || isCompressing}
                      size="icon-xs"
                      title={t('actions.remove')}
                      variant="destructive"
                      onClick={() => {
                        setIsListLoading(true);
                        invokeBackend<FileListPayload>('remove_items_from_list', { keys: [cImage.id] })
                          .then((payload) => updateList(payload))
                          .finally(() => setIsListLoading(false));
                      }}
                    >
                      <X />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default FileListTable;
