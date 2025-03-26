import { Accordion, AccordionItem, Checkbox, Selection, Tab, Tabs } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import JpegOptions from '@/components/side-panel/compression-options/JpegOptions.tsx';
import useUIStore from '@/stores/ui.store.ts';
import PngOptions from '@/components/side-panel/compression-options/PngOptions.tsx';

enum ACCORDION_KEY {
  JPEG = 'jpeg_accordion',
  PNG = 'png_accordion',
  WEBP = 'webp_accordion',
  TIFF = 'tiff_accordion',
}

function CompressionOptions() {
  const { t } = useTranslation();
  const {
    jpegAccordionOpen,
    pngAccordionOpen,
    webpAccordionOpen,
    tiffAccordionOpen,
    setJpegAccordionOpen,
    setPngAccordionOpen,
    setWebpAccordionOpen,
    setTiffAccordionOpen,
  } = useUIStore();

  const defaultAccordionOpen: ACCORDION_KEY[] = [];
  if (jpegAccordionOpen) {
    defaultAccordionOpen.push(ACCORDION_KEY.JPEG);
  }
  if (pngAccordionOpen) {
    defaultAccordionOpen.push(ACCORDION_KEY.PNG);
  }
  if (webpAccordionOpen) {
    defaultAccordionOpen.push(ACCORDION_KEY.WEBP);
  }
  if (tiffAccordionOpen) {
    defaultAccordionOpen.push(ACCORDION_KEY.TIFF);
  }

  const handleAccordionOpen = (keys: Selection) => {
    if (keys === 'all') {
      setJpegAccordionOpen(true);
      setPngAccordionOpen(true);
      setWebpAccordionOpen(true);
      setTiffAccordionOpen(true);

      return;
    }

    setJpegAccordionOpen(keys.has(ACCORDION_KEY.JPEG));
    setPngAccordionOpen(keys.has(ACCORDION_KEY.PNG));
    setWebpAccordionOpen(keys.has(ACCORDION_KEY.WEBP));
    setTiffAccordionOpen(keys.has(ACCORDION_KEY.TIFF));
  };

  return (
    <div className="size-full">
      <div className="bg-content2 text-foreground-500 flex h-[32px] items-center justify-center rounded-t-sm text-xs font-semibold">
        {t('compression_options.compression')}
      </div>
      <div className="p-2 text-sm">
        <Tabs fullWidth size="sm">
          <Tab title={t('quality')}>
            <div className="flex flex-col gap-2">
              <Accordion
                isCompact
                keepContentMounted
                className="!px-0"
                defaultSelectedKeys={defaultAccordionOpen}
                itemClasses={{
                  base: 'shadow-none bg-content2',
                  content: 'py-2',
                }}
                selectionMode="multiple"
                variant="splitted"
                onSelectionChange={handleAccordionOpen}
              >
                <AccordionItem key={ACCORDION_KEY.JPEG} aria-label={t('formats.jpeg')} title={t('formats.jpeg')}>
                  <JpegOptions></JpegOptions>
                </AccordionItem>
                <AccordionItem key={ACCORDION_KEY.PNG} aria-label={t('formats.png')} title={t('formats.png')}>
                  <PngOptions></PngOptions>
                </AccordionItem>
                <AccordionItem key={ACCORDION_KEY.WEBP} aria-label={t('formats.webp')} title={t('formats.webp')}>
                  cccc
                </AccordionItem>
                <AccordionItem key={ACCORDION_KEY.TIFF} aria-label={t('formats.tiff')} title={t('formats.tiff')}>
                  dddd
                </AccordionItem>
              </Accordion>

              <Checkbox disableAnimation size="sm">
                {t('compression_options.lossless')}
              </Checkbox>
              <Checkbox disableAnimation size="sm">
                {t('compression_options.keep_metadata')}
              </Checkbox>
            </div>
          </Tab>
          <Tab title={t('size')}>
            <div>{t('size')}</div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

export default CompressionOptions;
