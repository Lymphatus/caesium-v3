import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import useCompressionOptionsStore from '@/stores/compression-options.store.ts';
import { TIFF_COMPRESSION_METHOD, TIFF_DEFLATE_LEVEL } from '@/types.ts';
import { cn } from '@/lib/utils';

function TiffOptions() {
  const { t } = useTranslation();

  const { tiffOptions, setTiffOptions } = useCompressionOptionsStore();

  const compressionMethods = [
    { key: TIFF_COMPRESSION_METHOD.NONE, label: t('compression_options.tiff.none') },
    { key: TIFF_COMPRESSION_METHOD.DEFLATE, label: t('compression_options.tiff.deflate') },
    { key: TIFF_COMPRESSION_METHOD.LZW, label: t('compression_options.tiff.lzw') },
    { key: TIFF_COMPRESSION_METHOD.PACKBITS, label: t('compression_options.tiff.packbits') },
  ];

  const deflateMarks = [
    { value: TIFF_DEFLATE_LEVEL.FAST, label: t('compression_options.tiff.fast') },
    { value: TIFF_DEFLATE_LEVEL.BALANCED, label: t('compression_options.tiff.balanced') },
    { value: TIFF_DEFLATE_LEVEL.BEST, label: t('compression_options.tiff.best') },
  ];
  const deflateDisabled = tiffOptions.method !== TIFF_COMPRESSION_METHOD.DEFLATE;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Label>{t('compression_options.tiff.compression_method')}</Label>
        <Select
          value={tiffOptions.method}
          onValueChange={(value) => setTiffOptions({ method: value as TIFF_COMPRESSION_METHOD })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {compressionMethods.map((cm) => (
              <SelectItem key={cm.key} value={cm.key}>
                {cm.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-left text-sm">{t('compression_options.tiff.deflate_level')}</span>
        <Slider
          aria-label={t('compression_options.tiff.deflate_level')}
          disabled={deflateDisabled}
          max={2}
          min={0}
          step={1}
          value={[tiffOptions.deflateLevel]}
          onValueChange={([v]) => setTiffOptions({ deflateLevel: v })}
        />
        <div className="flex justify-between text-xs select-none">
          {deflateMarks.map((mark) => (
            <span
              key={mark.value}
              className={cn(
                'text-muted-foreground',
                !deflateDisabled && tiffOptions.deflateLevel >= mark.value && 'text-foreground',
              )}
            >
              {mark.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TiffOptions;
