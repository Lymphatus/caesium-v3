import { Select, SelectItem } from '@heroui/react';
import { NumberInput } from '@/components/ui/number-input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

import { useTranslation } from 'react-i18next';
import useCompressionOptionsStore from '@/stores/compression-options.store.ts';
import { CHROMA_SUBSAMPLING } from '@/types.ts';

function JpegOptions() {
  const { t } = useTranslation();

  const { jpegOptions, setJpegOptions } = useCompressionOptionsStore();

  const chromaSubsamplings = [
    { key: CHROMA_SUBSAMPLING.AUTO, label: t('chroma_subsampling_auto') },
    { key: CHROMA_SUBSAMPLING.CS444, label: '4:4:4' },
    { key: CHROMA_SUBSAMPLING.CS422, label: '4:2:2' },
    { key: CHROMA_SUBSAMPLING.CS420, label: '4:2:0' },
    { key: CHROMA_SUBSAMPLING.CS411, label: '4:1:1' },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>{t('quality')}</Label>
        <NumberInput
          aria-label={t('quality')}
          className="max-w-32"
          disabled={jpegOptions.optimize}
          max={100}
          min={0}
          size="sm"
          value={jpegOptions.quality}
          onValueChange={(value) => setJpegOptions({ quality: value })}
        />
      </div>
      <Slider
        disabled={jpegOptions.optimize}
        max={100}
        min={0}
        step={1}
        value={[jpegOptions.quality]}
        onValueChange={([value]) => setJpegOptions({ quality: value })}
      />
      <Select
        disallowEmptySelection
        classNames={{
          label: 'text-md',
          trigger: 'shadow-none',
          popoverContent: 'bg-content2 border-2 border-content1',
        }}
        label={t('compression_options.chroma_subsampling')}
        labelPlacement="outside"
        selectedKeys={[jpegOptions.chromaSubsampling]}
        selectionMode="single"
        size="sm"
        variant="faded"
        onSelectionChange={(value) =>
          setJpegOptions({ chromaSubsampling: (value.currentKey as CHROMA_SUBSAMPLING) || CHROMA_SUBSAMPLING.AUTO })
        }
      >
        {chromaSubsamplings.map((cs) => (
          <SelectItem key={cs.key}>{cs.label}</SelectItem>
        ))}
      </Select>
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col">
          <Label htmlFor="switch-jpeg-progressive">{t('compression_options.progressive')}</Label>
        </div>
        <Switch
          checked={jpegOptions.progressive}
          id="switch-jpeg-progressive"
          onCheckedChange={(value) => setJpegOptions({ progressive: value })}
        ></Switch>
      </div>
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col">
          <Label htmlFor="switch-jpeg-optimize">{t('compression_options.lossless')}</Label>
        </div>
        <Switch
          checked={jpegOptions.optimize}
          id="switch-jpeg-optimize"
          onCheckedChange={(value) => setJpegOptions({ optimize: value })}
        ></Switch>
      </div>
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col">
          <Label htmlFor="switch-jpeg-preserve-icc">{t('compression_options.preserve_icc')}</Label>
        </div>
        <Switch
          checked={jpegOptions.preserveICC}
          id="switch-jpeg-preserve-icc"
          onCheckedChange={(value) => setJpegOptions({ preserveICC: value })}
        ></Switch>
      </div>
    </div>
  );
}

export default JpegOptions;
