import { Accordion, AccordionItem, Checkbox, Tab, Tabs } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import JpegOptions from '@/components/side-panel/compression-options/JpegOptions.tsx';

function CompressionOptions() {
  const { t } = useTranslation();

  return (
    <div className="size-full">
      <div className="bg-content2 text-foreground-500 flex h-[32px] items-center justify-center rounded-t-sm text-xs font-semibold">
        {t('compression_options.compression')}
      </div>
      <div className="p-2 text-sm">
        <Tabs fullWidth size="sm">
          <Tab title={t('quality')}>
            <div className="flex flex-col gap-2 text-left">
              <Accordion
                isCompact
                keepContentMounted
                className="px-0"
                defaultSelectedKeys="all"
                selectionMode="multiple"
              >
                <AccordionItem key="1" aria-label={t('formats.jpeg')} title={t('formats.jpeg')}>
                  <JpegOptions></JpegOptions>
                </AccordionItem>
                <AccordionItem key="2" aria-label={t('formats.png')} title={t('formats.png')}>
                  bbbb
                </AccordionItem>
                <AccordionItem key="3" aria-label={t('formats.webp')} title={t('formats.webp')}>
                  cccc
                </AccordionItem>
                <AccordionItem key="4" aria-label={t('formats.tiff')} title={t('formats.tiff')}>
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
