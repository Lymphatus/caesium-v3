import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  SharedSelection,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
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

  const handleSizeFilterPatternChange = (value: SharedSelection) => {
    if (value === 'all') {
      return setSizeFilterPattern(FILE_SIZE_FILTER_PATTERN.LESS_THAN);
    }

    return setSizeFilterPattern(value.currentKey as FILE_SIZE_FILTER_PATTERN);
  };

  const handleSizeFilterUnitChange = (value: SharedSelection) => {
    if (value === 'all') {
      return setSizeFilterUnit(FILE_SIZE_UNIT.BYTE);
    }

    return setSizeFilterUnit(parseInt(value.currentKey || '1') as FILE_SIZE_UNIT);
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

  const rows = [...importList].map((item) => (
    <TableRow key={item}>
      <TableCell className="w-full">{item}</TableCell>
    </TableRow>
  ));

  return (
    <Modal
      backdrop="blur"
      classNames={{
        backdrop: 'bg-content3/50',
      }}
      isDismissable={false}
      isOpen={advancedImportDialogOpen}
      shadow="none"
      size="xl"
      onClose={() => setAdvancedImportDialogOpen(false)}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{t('advanced_import_dialog.title')}</ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="relative block h-[300px] w-full overflow-auto">
              <Table
                fullWidth
                isHeaderSticky
                removeWrapper
                aria-label="File list"
                checkboxesProps={{ disableAnimation: true }}
                className="rounded-t-sm"
                classNames={{
                  base: 'h-full justify-between overflow-auto bg-background',
                  th: 'h-8 first:rounded-b-none first:rounded-t-none last:rounded-b-none last:rounded-t-none [&:first-child]:w-[32px]',
                  td: 'text-nowrap',
                }}
                layout="auto"
                radius="sm"
                selectedKeys={selectedItems}
                selectionMode="multiple"
                shadow="none"
                onSelectionChange={(v) => {
                  if (v === 'all') {
                    setSelectedItems([...importList]);
                    return;
                  }
                  setSelectedItems([...(v as unknown as string[])]);
                }}
              >
                <TableHeader>
                  <TableColumn width={'100%'}>{t('advanced_import_dialog.path')}</TableColumn>
                </TableHeader>
                <TableBody>{rows}</TableBody>
              </Table>
            </div>

            <div className="flex w-full justify-start gap-2">
              <Dropdown isDisabled={isValidationInProgress}>
                <DropdownTrigger>
                  <Button size="icon-sm" title={t('')} variant="outline">
                    <Plus></Plus>
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Import actions">
                  <DropdownItem
                    key="add_files"
                    description={t('advanced_import_dialog.add_files_description')}
                    startContent={<FilePlus></FilePlus>}
                    onPress={() => openFileDialog('file')}
                  >
                    {t('advanced_import_dialog.add_files')}
                  </DropdownItem>
                  <DropdownItem
                    key="add_folder"
                    description={t('advanced_import_dialog.add_folders_description')}
                    startContent={<FolderPlus></FolderPlus>}
                    onPress={() => openFileDialog('folder')}
                  >
                    {t('advanced_import_dialog.add_folders')}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
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
                  disallowEmptySelection
                  aria-label={t('compression_options.output_options.output_format')}
                  classNames={{
                    trigger: 'shadow-none',
                    popoverContent: 'bg-content2 border-2 border-content1',
                  }}
                  isDisabled={!sizeFilter || isValidationInProgress}
                  label={''}
                  selectedKeys={[sizeFilterPattern]}
                  selectionMode="single"
                  size="sm"
                  variant="faded"
                  onSelectionChange={handleSizeFilterPatternChange}
                >
                  <SelectItem key={FILE_SIZE_FILTER_PATTERN.LESS_THAN}>
                    {t('advanced_import_dialog.less_than')}
                  </SelectItem>
                  <SelectItem key={FILE_SIZE_FILTER_PATTERN.EQUAL_TO}>
                    {t('advanced_import_dialog.equal_to')}
                  </SelectItem>
                  <SelectItem key={FILE_SIZE_FILTER_PATTERN.GREATER_THAN}>
                    {t('advanced_import_dialog.greater_than')}
                  </SelectItem>
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
                  disallowEmptySelection
                  aria-label={t('compression_options.output_options.output_format')}
                  classNames={{
                    trigger: 'shadow-none',
                    popoverContent: 'bg-content2 border-2 border-content1',
                  }}
                  isDisabled={!sizeFilter || isValidationInProgress}
                  label={''}
                  selectedKeys={[sizeFilterUnit.toString()]}
                  selectionMode="single"
                  size="sm"
                  variant="faded"
                  onSelectionChange={handleSizeFilterUnitChange}
                >
                  {sizeUnits.map((unit) => (
                    <SelectItem key={unit.key}>{unit.label}</SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            <Input
              isClearable
              classNames={{
                inputWrapper: 'shadow-none',
                label: 'text-sm ml-[-1px]',
              }}
              isDisabled={isValidationInProgress}
              label={t('advanced_import_dialog.filename_pattern')}
              labelPlacement="outside"
              placeholder=".*\.jpg|.*\.png"
              size="sm"
              value={filenamePattern}
              variant="faded"
              onValueChange={(v) => setFilenamePattern(v)}
            />
          </div>
        </ModalBody>

        <ModalFooter>
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
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default AdvancedImportDialog;
