import { Select, SelectItem } from '@heroui/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';
import useOutputOptionsStore from '@/stores/output-options.store.ts';
import { open } from '@tauri-apps/plugin-dialog';
import { FILE_DATE, MOVE_ORIGINAL_FILE, OUTPUT_FORMAT } from '@/types.ts';
import { TriangleAlert } from 'lucide-react';
import { Button } from '../ui/button';

function OutputOptions() {
  const { t } = useTranslation();

  const {
    outputFolder,
    sameFolderAsInput,
    keepFolderStructure,
    skipIfOutputIsBigger,
    moveOriginalFile,
    moveOriginalFileType,
    keepFileDates,
    outputFormat,
    suffix,
    setKeepFolderStructure,
    setSkipIfOutputIsBigger,
    setSameFolderAsInput,
    setOutputFolder,
    setMoveOriginalFile,
    setMoveOriginalFileType,
    setKeepFileDates,
    setOutputFormat,
    setSuffix,
  } = useOutputOptionsStore();

  const toggleFileDateCreation = (type: FILE_DATE, enabled: boolean) => {
    const selection = [...keepFileDates];
    if (enabled && !selection.includes(type)) {
      selection.push(type);
    } else if (!enabled && selection.includes(type)) {
      selection.splice(selection.indexOf(type), 1);
    }

    setKeepFileDates(selection);
  };

  const moveOriginalFileTypes = [
    { key: MOVE_ORIGINAL_FILE.TRASH, label: t('move_original_files_modes.trash') },
    { key: MOVE_ORIGINAL_FILE.DELETE, label: t('move_original_files_modes.delete') },
  ];
  const outputFormats = [
    { key: OUTPUT_FORMAT.ORIGINAL, label: t('formats.original') },
    { key: OUTPUT_FORMAT.JPEG, label: t('formats.jpeg') },
    { key: OUTPUT_FORMAT.PNG, label: t('formats.png') },
    { key: OUTPUT_FORMAT.WEBP, label: t('formats.webp') },
    { key: OUTPUT_FORMAT.TIFF, label: t('formats.tiff') },
  ];

  const moveOriginalFileWarning = moveOriginalFileType === MOVE_ORIGINAL_FILE.DELETE && (
    <Alert variant="warning">
      <TriangleAlert />
      <AlertDescription>{t('move_original_files_modes.delete_warning')}</AlertDescription>
    </Alert>
  );

  return (
    <div className="size-full overflow-auto">
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex w-full flex-col gap-1">
          <Label htmlFor="input-output-folder">{t('compression_options.output_folder')}</Label>
          <div className="flex items-center gap-1">
            <Input
              readOnly
              disabled={sameFolderAsInput}
              id="input-output-folder"
              placeholder={t('compression_options.output_folder')}
              value={outputFolder}
            />
            <Button
              disabled={sameFolderAsInput}
              variant="secondary"
              onClick={async () => {
                const folder = await open({ directory: true, multiple: false });
                if (folder) {
                  setOutputFolder(folder);
                }
              }}
            >
              {t('select_dots')}
            </Button>
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col">
              <Label htmlFor="switch-same-folder-as-input">
                {t('compression_options.output_options.same_folder_as_input')}
              </Label>
            </div>
            <Switch
              checked={sameFolderAsInput}
              id="switch-same-folder-as-input"
              onCheckedChange={setSameFolderAsInput}
            ></Switch>
          </div>
          {sameFolderAsInput && suffix.length === 0 && (
            <Alert variant="warning">
              <TriangleAlert />
              <AlertDescription>
                {t('compression_options.output_options.same_folder_as_input_warning')}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <Separator />
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col">
            <Label htmlFor="switch-keep-folder-structure">
              {t('compression_options.output_options.keep_structure')}
            </Label>
          </div>
          <Switch
            checked={keepFolderStructure}
            id="switch-keep-folder-structure"
            onCheckedChange={setKeepFolderStructure}
          ></Switch>
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col">
            <Label htmlFor="switch-skip-if-output-is-bigger">
              {t('compression_options.output_options.skip_if_output_is_bigger')}
            </Label>
          </div>
          <Switch
            checked={skipIfOutputIsBigger}
            id="switch-skip-if-output-is-bigger"
            onCheckedChange={setSkipIfOutputIsBigger}
          ></Switch>
        </div>

        <div className="flex w-full flex-col justify-between gap-1">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col">
              <Label htmlFor="switch-move-original-file">{t('compression_options.output_options.move_original')}</Label>
            </div>
            <Switch
              checked={moveOriginalFile}
              id="switch-move-original-file"
              onCheckedChange={setMoveOriginalFile}
            ></Switch>
          </div>
          <Select
            disallowEmptySelection
            aria-label={t('compression_options.output_options.move_original')}
            classNames={{
              label: 'text-md',
              trigger: 'shadow-none',
              description: 'text-left',
              popoverContent: 'bg-content2 border-2 border-content1',
              helperWrapper: 'px-0',
            }}
            description={moveOriginalFileWarning}
            isDisabled={!moveOriginalFile}
            label={''}
            labelPlacement="outside"
            selectedKeys={[moveOriginalFileType]}
            selectionMode="single"
            size="sm"
            variant="faded"
            onSelectionChange={(value) =>
              setMoveOriginalFileType((value.currentKey as MOVE_ORIGINAL_FILE) || MOVE_ORIGINAL_FILE.TRASH)
            }
          >
            {moveOriginalFileTypes.map((t) => (
              <SelectItem key={t.key}>{t.label}</SelectItem>
            ))}
          </Select>
        </div>
        <Separator />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={keepFileDates.length === 3 ? true : keepFileDates.length > 0 ? 'indeterminate' : false}
              id="checkbox-keep-file-dates"
              onCheckedChange={(v) =>
                setKeepFileDates(v === true ? [FILE_DATE.CREATED, FILE_DATE.MODIFIED, FILE_DATE.ACCESSED] : [])
              }
            />
            <Label htmlFor="checkbox-keep-file-dates">{t('compression_options.output_options.keep_file_dates')}</Label>
          </div>

          <div className="ml-4 flex items-center gap-2">
            <Checkbox
              checked={keepFileDates.includes(FILE_DATE.CREATED)}
              id="checkbox-file-date-creation"
              onCheckedChange={(v) => toggleFileDateCreation(FILE_DATE.CREATED, v === true)}
            />
            <Label htmlFor="checkbox-file-date-creation">{t('file_dates.creation')}</Label>
          </div>
          <div className="ml-4 flex items-center gap-2">
            <Checkbox
              checked={keepFileDates.includes(FILE_DATE.MODIFIED)}
              id="checkbox-file-date-modified"
              onCheckedChange={(v) => toggleFileDateCreation(FILE_DATE.MODIFIED, v === true)}
            />
            <Label htmlFor="checkbox-file-date-modified">{t('file_dates.last_modified')}</Label>
          </div>
          <div className="ml-4 flex items-center gap-2">
            <Checkbox
              checked={keepFileDates.includes(FILE_DATE.ACCESSED)}
              id="checkbox-file-date-accessed"
              onCheckedChange={(v) => toggleFileDateCreation(FILE_DATE.ACCESSED, v === true)}
            />
            <Label htmlFor="checkbox-file-date-accessed">{t('file_dates.last_access')}</Label>
          </div>
        </div>
        <Separator />
        <Select
          disallowEmptySelection
          aria-label={t('compression_options.output_options.output_format')}
          classNames={{
            label: 'text-md',
            trigger: 'shadow-none',
            popoverContent: 'bg-content2 border-2 border-content1',
          }}
          label={t('compression_options.output_options.output_format')}
          labelPlacement="outside"
          selectedKeys={[outputFormat]}
          selectionMode="single"
          size="sm"
          variant="faded"
          onSelectionChange={(value) => setOutputFormat((value.currentKey as OUTPUT_FORMAT) || OUTPUT_FORMAT.ORIGINAL)}
        >
          {outputFormats.map((t) => (
            <SelectItem key={t.key}>{t.label}</SelectItem>
          ))}
        </Select>

        <div className="flex flex-col gap-1">
          <Label htmlFor="input-suffix">{t('compression_options.output_options.suffix')}</Label>
          <Input
            id="input-suffix"
            placeholder="_compressed"
            value={suffix}
            onChange={(e) => setSuffix(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default OutputOptions;
