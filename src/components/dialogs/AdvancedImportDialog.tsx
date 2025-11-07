import {
  Button,
  Divider,
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
  NumberInput,
  Select,
  SelectItem,
  SharedSelection,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import useUIStore from '@/stores/ui.store.ts';
import { useTranslation } from 'react-i18next';
import { Delete, FilePlus, FileText, Folder, FolderPlus, Image, ListPlus, Plus } from 'lucide-react';
import { useState } from 'react';
import { FILE_SIZE_FILTER_PATTERN, FILE_SIZE_UNIT } from '@/types.ts';
import { open } from '@tauri-apps/plugin-dialog';

type FileItem = {
  path: string;
  type: 'file' | 'folder' | 'list';
};
function AdvancedImportDialog() {
  const { advancedImportDialogOpen, setAdvancedImportDialogOpen } = useUIStore();
  const { t } = useTranslation();

  const [importList, setImportList] = useState<Set<FileItem>>(new Set<FileItem>());
  const [scanSubfolders, setScanSubfolders] = useState(true);
  const [filenamePattern, setFilenamePattern] = useState('');
  const [sizeFilter, setSizeFilter] = useState(false);
  const [sizeFilterValue, setSizeFilterValue] = useState(500);
  const [sizeFilterPattern, setSizeFilterPattern] = useState(FILE_SIZE_FILTER_PATTERN.LESS_THAN);
  const [sizeFilterUnit, setSizeFilterUnit] = useState(FILE_SIZE_UNIT.BYTE);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

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

  const openFileDialog = async (mode: 'file' | 'folder' | 'list') => {
    let filters: { name: string; extensions: string[] }[] = [];
    if (mode === 'file') {
      filters = [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'tiff'] }];
    } else if (mode === 'list') {
      filters = [{ name: 'Text files', extensions: ['txt'] }];
    }
    const options = {
      multiple: true,
      directory: mode === 'folder',
      filters,
    };

    const selected = await open(options);

    if (Array.isArray(selected)) {
      const fileItems: FileItem[] = selected.map((item) => ({
        path: item,
        type: mode,
      }));
      setImportList(new Set<FileItem>([...importList, ...fileItems]));
    }
  };

  const sizeUnits = [
    {
      key: FILE_SIZE_UNIT.BYTE,
      label: t('size_units.byte', {
        count: 2,
      }),
    },
    { key: FILE_SIZE_UNIT.KILOBYTE, label: t('size_units.kb') },
    { key: FILE_SIZE_UNIT.MEGABYTE, label: t('size_units.mb') },
  ];

  const getFileListItemIcon = (type: 'file' | 'folder' | 'list') => {
    if (type === 'file') {
      return <Image className="size-5"></Image>;
    } else if (type === 'folder') {
      return <Folder className="size-5"></Folder>;
    } else if (type === 'list') {
      return <FileText className="size-5"></FileText>;
    }

    return null;
  };

  const rows = [...importList].map((item) => (
    <TableRow key={item.path}>
      <TableCell>{getFileListItemIcon(item.type)}</TableCell>
      <TableCell className="w-full">{item.path}</TableCell>
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
                    setSelectedItems([...importList].map((item) => item.path));
                    return;
                  }
                  setSelectedItems([...(v as unknown as string[])]);
                }}
              >
                <TableHeader>
                  <TableColumn>{t('advanced_import_dialog.type')}</TableColumn>
                  <TableColumn width={'100%'}>{t('advanced_import_dialog.path')}</TableColumn>
                </TableHeader>
                <TableBody>{rows}</TableBody>
              </Table>
            </div>

            <div className="flex w-full justify-start gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    disableRipple
                    isIconOnly
                    size="sm"
                    startContent={<Plus className="size-4"></Plus>}
                    title={t('')}
                    variant="solid"
                  ></Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Import actions">
                  <DropdownItem
                    key="add_files"
                    description="Add files to the import list"
                    startContent={<FilePlus></FilePlus>}
                    onPress={() => openFileDialog('file')}
                  >
                    Add files
                  </DropdownItem>
                  <DropdownItem
                    key="add_folder"
                    description="Scan a folder and add to the import list"
                    startContent={<FolderPlus></FolderPlus>}
                    onPress={() => openFileDialog('folder')}
                  >
                    Add folder
                  </DropdownItem>
                  <DropdownItem
                    key="add_list"
                    description="Parse a list from a text file"
                    startContent={<ListPlus></ListPlus>}
                    onPress={() => openFileDialog('list')}
                  >
                    Import from list file
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <Button
                disableRipple
                isIconOnly
                isDisabled={selectedItems.length === 0}
                size="sm"
                startContent={<Delete className="text-danger size-4"></Delete>}
                title={t('actions.remove')}
                variant="solid"
                onPress={() => {
                  const newList = [...importList].filter((item) => !selectedItems.includes(item.path));
                  setSelectedItems([]);
                  setImportList(new Set<FileItem>(newList));
                }}
              ></Button>
            </div>
            <Divider></Divider>
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col text-sm">
                <span>{t('settings.scan_subfolders_on_import')}</span>
              </div>
              <Switch isSelected={scanSubfolders} size="sm" onValueChange={setScanSubfolders}></Switch>
            </div>

            <div className="flex w-full flex-col items-center justify-between gap-1">
              <div className="flex w-full items-center justify-between">
                <div className="flex flex-col text-sm">
                  <span>{t('advanced_import_dialog.size_filter')}</span>
                </div>
                <Switch isSelected={sizeFilter} size="sm" onValueChange={setSizeFilter}></Switch>
              </div>
              <NumberInput
                hideStepper
                aria-label="Size filter"
                classNames={{
                  inputWrapper: 'shadow-none px-0',
                  label: 'text-sm ml-[-1px]',
                }}
                endContent={
                  <Select
                    disallowEmptySelection
                    aria-label={t('compression_options.output_options.output_format')}
                    classNames={{
                      trigger: 'shadow-none rounded-none rounded-r-sm ml-[2px]',
                    }}
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
                }
                isDisabled={!sizeFilter}
                label={t('')}
                labelPlacement="outside"
                size="sm"
                startContent={
                  <Select
                    disallowEmptySelection
                    aria-label={t('compression_options.output_options.output_format')}
                    classNames={{
                      trigger: 'shadow-none rounded-none rounded-l-sm ml-[-1px]',
                    }}
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
                }
                type="number"
                value={sizeFilterValue}
                variant="faded"
                onValueChange={(v) => setSizeFilterValue(v)}
              />
            </div>

            <Input
              isClearable
              classNames={{
                inputWrapper: 'shadow-none',
                label: 'text-sm ml-[-1px]',
              }}
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
            <Button disableRipple color="primary" isDisabled={importList.size === 0} onPress={() => {}}>
              {t('advanced_import_dialog.import')}
            </Button>
            <Button disableRipple variant="flat" onPress={() => setAdvancedImportDialogOpen(false)}>
              {t('cancel')}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default AdvancedImportDialog;
