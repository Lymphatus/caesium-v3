import { Select, SelectItem, SharedSelection } from '@heroui/react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NumberInput } from '@/components/ui/number-input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import JpegOptions from '@/components/side-panel/compression-options/JpegOptions.tsx';
import useUIStore from '@/stores/ui.store.ts';
import PngOptions from '@/components/side-panel/compression-options/PngOptions.tsx';
import WebpOptions from '@/components/side-panel/compression-options/WebpOptions.tsx';
import TiffOptions from '@/components/side-panel/compression-options/TiffOptions.tsx';
import useCompressionOptionsStore from '@/stores/compression-options.store.ts';
import GifOptions from '@/components/side-panel/compression-options/GifOptions.tsx';
import { COMPRESSION_MODE, FILE_SIZE_UNIT } from '@/types.ts';

enum ACCORDION_KEY {
  JPEG = 'jpeg_accordion',
  PNG = 'png_accordion',
  GIF = 'gif_accordion',
  WEBP = 'webp_accordion',
  TIFF = 'tiff_accordion',
}

function CompressionOptions() {
  const { t } = useTranslation();
  const {
    jpegAccordionOpen,
    pngAccordionOpen,
    gifAccordionOpen,
    webpAccordionOpen,
    tiffAccordionOpen,
    setJpegAccordionOpen,
    setPngAccordionOpen,
    setGifAccordionOpen,
    setWebpAccordionOpen,
    setTiffAccordionOpen,
  } = useUIStore();

  const {
    keepMetadata,
    setKeepMetadata,
    maxSize,
    setMaxSize,
    maxSizeUnit,
    setMaxSizeUnit,
    setCompressionMode,
    compressionMode,
  } = useCompressionOptionsStore();

  const handleChange = (value: SharedSelection) => {
    if (value === 'all') {
      setMaxSizeUnit(1024);
      return;
    }

    setMaxSizeUnit(parseInt(value.currentKey || '1024'));
  };

  const maxSizeUnits = [
    {
      key: FILE_SIZE_UNIT.BYTE,
      label: t('size_units.byte', {
        count: maxSize,
      }),
    },
    { key: FILE_SIZE_UNIT.KILOBYTE, label: t('size_units.kb') },
    { key: FILE_SIZE_UNIT.MEGABYTE, label: t('size_units.mb') },
  ];

  const defaultAccordionOpen: ACCORDION_KEY[] = [];
  if (jpegAccordionOpen) {
    defaultAccordionOpen.push(ACCORDION_KEY.JPEG);
  }
  if (pngAccordionOpen) {
    defaultAccordionOpen.push(ACCORDION_KEY.PNG);
  }
  if (gifAccordionOpen) {
    defaultAccordionOpen.push(ACCORDION_KEY.GIF);
  }
  if (webpAccordionOpen) {
    defaultAccordionOpen.push(ACCORDION_KEY.WEBP);
  }
  if (tiffAccordionOpen) {
    defaultAccordionOpen.push(ACCORDION_KEY.TIFF);
  }

  const handleAccordionOpen = (values: string[]) => {
    setJpegAccordionOpen(values.includes(ACCORDION_KEY.JPEG));
    setPngAccordionOpen(values.includes(ACCORDION_KEY.PNG));
    setGifAccordionOpen(values.includes(ACCORDION_KEY.GIF));
    setWebpAccordionOpen(values.includes(ACCORDION_KEY.WEBP));
    setTiffAccordionOpen(values.includes(ACCORDION_KEY.TIFF));
  };

  const handleCompressionModeChange = (value: string) => {
    if (value === 'size') {
      setCompressionMode(COMPRESSION_MODE.SIZE);
      return;
    }

    setCompressionMode(COMPRESSION_MODE.QUALITY);
  };

  return (
    <div className="size-full overflow-auto">
      <div className="text-sm">
        <Tabs
          value={compressionMode === COMPRESSION_MODE.SIZE ? 'size' : 'quality'}
          onValueChange={handleCompressionModeChange}
        >
          <TabsList className="w-full">
            <TabsTrigger value="quality">{t('quality')}</TabsTrigger>
            <TabsTrigger value="size">{t('size')}</TabsTrigger>
          </TabsList>
          <TabsContent value="quality">
            <div className="flex flex-col gap-2">
              <Accordion defaultValue={defaultAccordionOpen} type="multiple" onValueChange={handleAccordionOpen}>
                <AccordionItem value={ACCORDION_KEY.JPEG}>
                  <AccordionTrigger>{t('formats.jpeg')}</AccordionTrigger>
                  <AccordionContent>
                    <JpegOptions />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value={ACCORDION_KEY.PNG}>
                  <AccordionTrigger>{t('formats.png')}</AccordionTrigger>
                  <AccordionContent>
                    <PngOptions />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value={ACCORDION_KEY.GIF}>
                  <AccordionTrigger>{t('formats.gif')}</AccordionTrigger>
                  <AccordionContent>
                    <GifOptions />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value={ACCORDION_KEY.WEBP}>
                  <AccordionTrigger>{t('formats.webp')}</AccordionTrigger>
                  <AccordionContent>
                    <WebpOptions />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value={ACCORDION_KEY.TIFF}>
                  <AccordionTrigger>{t('formats.tiff')}</AccordionTrigger>
                  <AccordionContent>
                    <TiffOptions />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex w-full items-center justify-between">
                <div className="flex flex-col">
                  <Label htmlFor="switch-keep-metadata">{t('compression_options.keep_metadata')}</Label>
                </div>
                <Switch checked={keepMetadata} id="switch-keep-metadata" onCheckedChange={setKeepMetadata}></Switch>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="size">
            <div className="flex flex-col gap-1">
              <Label>{t('compression_options.max_output_size')}</Label>
              <div className="flex items-center gap-2">
                <NumberInput
                  aria-label={t('compression_options.max_output_size')}
                  className="flex-1"
                  max={999}
                  min={1}
                  placeholder="500"
                  size="sm"
                  step={1}
                  value={maxSize}
                  onValueChange={(v) => setMaxSize(v)}
                />
                <Select
                  disallowEmptySelection
                  aria-label={'units'}
                  className="max-w-[100px]"
                  classNames={{
                    label: 'hidden',
                    trigger: 'shadow-none',
                    popoverContent: 'bg-content2 border-2 border-content1',
                  }}
                  label={''}
                  selectedKeys={[maxSizeUnit.toString()]}
                  selectionMode="single"
                  size="sm"
                  variant="faded"
                  onSelectionChange={(v) => handleChange(v)}
                >
                  {maxSizeUnits.map((unit) => (
                    <SelectItem key={unit.key}>{unit.label}</SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default CompressionOptions;
