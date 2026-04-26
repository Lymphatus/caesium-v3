import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import useUIStore from '@/stores/ui.store.ts';
import { useTranslation } from 'react-i18next';
import { FilePlus, FolderPlus, Plus, X } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useEffect, useState } from 'react';
import { FILE_SIZE_FILTER_PATTERN, FILE_SIZE_UNIT } from '@/types.ts';
import { open } from '@tauri-apps/plugin-dialog';
import { listen } from '@tauri-apps/api/event';
import { invokeBackend } from '@/utils/invoker.tsx';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { NumberInput } from '../ui/number-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function AdvancedImportDialog() {
  const { advancedImportDialogOpen, setAdvancedImportDialogOpen } = useUIStore();
  const { t } = useTranslation();

  const [importList, setImportList] = useState<Set<string>>(new Set<string>());
  const [scanSubfolders, setScanSubfolders] = useState(true);
  const [filenamePattern, setFilenamePattern] = useState('');
  const [sizeFilter, setSizeFilter] = useState(false);
  const [sizeFilterValue, setSizeFilterValue] = useState(500);
  const [sizeFilterPattern, setSizeFilterPattern] = useState(FILE_SIZE_FILTER_PATTERN.LESS_THAN);
  const [sizeFilterUnit, setSizeFilterUnit] = useState(FILE_SIZE_UNIT.BYTE);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isValidationInProgress, setIsValidationInProgress] = useState(false);

  useEffect(() => {
    const listValidationFinished = listen('advancedImport:listValidationFinished', () => {
      setIsValidationInProgress(false);
      setImportList(new Set<string>());
      setSelectedItems([]);
      setAdvancedImportDialogOpen(false);
    });

    return () => {
      listValidationFinished.then((cleanupFn) => cleanupFn());
    };
  }, []);

  const handleSizeFilterPatternChange = (value: string) => {
    setSizeFilterPattern(value as FILE_SIZE_FILTER_PATTERN);
  };

  const handleSizeFilterUnitChange = (value: string) => {
    setSizeFilterUnit(parseInt(value || '1') as FILE_SIZE_UNIT);
  };

  const openFileDialog = async (mode: 'file' | 'folder') => {
    const options = {
      multiple: true,
      directory: mode === 'folder',
    };

    const selected = await open(options);

    if (Array.isArray(selected)) {
      setImportList(new Set<string>([...importList, ...selected]));
    }
  };

  const sizeUnits = [
    {
      key: FILE_SIZE_UNIT.BYTE,
      label: t('size_units.byte', {
        count: sizeFilterValue,
      }),
    },
    { key: FILE_SIZE_UNIT.KILOBYTE, label: t('size_units.kb') },
    { key: FILE_SIZE_UNIT.MEGABYTE, label: t('size_units.mb') },
  ];

  const items = [...importList];
  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const someSelected = selectedItems.length > 0 && !allSelected;
  const toggleAllItems = (checked: boolean | 'indeterminate') => {
    setSelectedItems(checked === true ? [...items] : []);
  };
  const toggleItem = (item: string, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedItems([...selectedItems, item]);
    } else {
      setSelectedItems(selectedItems.filter((s) => s !== item));
    }
  };

  return (
    <Dialog
      open={advancedImportDialogOpen}
      onOpenChange={(open) => {
        if (!open) setAdvancedImportDialogOpen(false);
      }}
    >
      <DialogContent
        className="sm:max-w-xl"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t('advanced_import_dialog.title')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="relative block h-[300px] w-full overflow-auto">
            <Table>
              <TableHeader className="bg-background sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-[40px] text-center">
                    <Checkbox
                      aria-label="Select all"
                      checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                      onCheckedChange={toggleAllItems}
                    />
                  </TableHead>
                  <TableHead>{t('advanced_import_dialog.path')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const isSelected = selectedItems.includes(item);
                  return (
                    <TableRow key={item} data-state={isSelected ? 'selected' : undefined}>
                      <TableCell className="text-center">
                        <Checkbox
                          aria-label={`Select ${item}`}
                          checked={isSelected}
                          onCheckedChange={(v) => toggleItem(item, v)}
                        />
                      </TableCell>
                      <TableCell className="w-full">{item}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex w-full justify-start gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isValidationInProgress} size="icon-sm" variant="outline">
                  <Plus />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => openFileDialog('file')}>
                  <FilePlus />
                  <div className="flex flex-col">
                    <span>{t('advanced_import_dialog.add_files')}</span>
                    <span className="text-muted-foreground text-xs">
                      {t('advanced_import_dialog.add_files_description')}
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => openFileDialog('folder')}>
                  <FolderPlus />
                  <div className="flex flex-col">
                    <span>{t('advanced_import_dialog.add_folders')}</span>
                    <span className="text-muted-foreground text-xs">
                      {t('advanced_import_dialog.add_folders_description')}
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              disabled={selectedItems.length === 0 || isValidationInProgress}
              size="icon-sm"
              title={t('actions.remove')}
              variant="destructive"
              onClick={() => {
                const newList = [...importList].filter((item) => !selectedItems.includes(item));
                setSelectedItems([]);
                setImportList(new Set<string>(newList));
              }}
            >
              <X></X>
            </Button>
          </div>
          <Separator />
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col text-sm">
              <Label htmlFor="switch-scan-subfolders">{t('settings.scan_subfolders_on_import')}</Label>
            </div>
            <Switch
              checked={scanSubfolders}
              disabled={isValidationInProgress}
              id="switch-scan-subfolders"
              onCheckedChange={setScanSubfolders}
            />
          </div>

          <div className="flex w-full flex-col items-center justify-between gap-1">
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col text-sm">
                <Label htmlFor="switch-size-filter">{t('advanced_import_dialog.size_filter')}</Label>
              </div>
              <Switch
                checked={sizeFilter}
                disabled={isValidationInProgress}
                id="switch-size-filter"
                onCheckedChange={setSizeFilter}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                disabled={!sizeFilter || isValidationInProgress}
                value={sizeFilterPattern}
                onValueChange={handleSizeFilterPatternChange}
              >
                <SelectTrigger aria-label={t('compression_options.output_options.output_format')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FILE_SIZE_FILTER_PATTERN.LESS_THAN}>
                    {t('advanced_import_dialog.less_than')}
                  </SelectItem>
                  <SelectItem value={FILE_SIZE_FILTER_PATTERN.EQUAL_TO}>
                    {t('advanced_import_dialog.equal_to')}
                  </SelectItem>
                  <SelectItem value={FILE_SIZE_FILTER_PATTERN.GREATER_THAN}>
                    {t('advanced_import_dialog.greater_than')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <NumberInput
                hideStepper
                aria-label="Size filter"
                disabled={!sizeFilter || isValidationInProgress}
                size="sm"
                value={sizeFilterValue}
                onValueChange={(v) => setSizeFilterValue(v)}
              />
              <Select
                disabled={!sizeFilter || isValidationInProgress}
                value={sizeFilterUnit.toString()}
                onValueChange={handleSizeFilterUnitChange}
              >
                <SelectTrigger aria-label={t('compression_options.output_options.output_format')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sizeUnits.map((unit) => (
                    <SelectItem key={unit.key} value={unit.key.toString()}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex w-full flex-col gap-1">
            <Label htmlFor="input-filename-pattern">{t('advanced_import_dialog.filename_pattern')}</Label>
            <Input
              disabled={isValidationInProgress}
              id="input-filename-pattern"
              placeholder=".*\.jpg|.*\.png"
              value={filenamePattern}
              onChange={(e) => setFilenamePattern(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <div className="flex w-full justify-end gap-2">
            <Button
              disabled={importList.size === 0}
              onClick={async () => {
                setIsValidationInProgress(true);
                await invokeBackend('add_from_advanced_import', {
                  files: [...importList],
                  recursive: scanSubfolders,
                  filter: {
                    pattern: filenamePattern,
                    size: {
                      enabled: sizeFilter,
                      value: sizeFilterValue,
                      unit: sizeFilterUnit,
                      pattern: sizeFilterPattern,
                    },
                  },
                });
                setIsValidationInProgress(false);
              }}
            >
              {isValidationInProgress ? (
                <>
                  <Spinner /> {t('advanced_import_dialog.validating_dots')}
                </>
              ) : (
                t('advanced_import_dialog.import')
              )}
            </Button>
            <Button
              disabled={isValidationInProgress}
              variant="secondary"
              onClick={() => setAdvancedImportDialogOpen(false)}
            >
              {t('cancel')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AdvancedImportDialog;
