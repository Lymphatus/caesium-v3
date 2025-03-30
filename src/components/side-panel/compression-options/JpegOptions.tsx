import { Checkbox, NumberInput, Select, SelectItem, Slider } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import useCompressionOptionsStore from '@/stores/compression-options.store.ts';
import { CHROMA_SUBSAMPLING } from '@/types.ts';

function JpegOptions() {
  const { t } = useTranslation();

  const { jpegOptions, setJpegOptions, lossless } = useCompressionOptionsStore();

  const chromaSubsamplings = [
    { key: CHROMA_SUBSAMPLING.AUTO, label: t('chroma_subsampling_auto') },
    { key: CHROMA_SUBSAMPLING.CS444, label: '4:4:4' },
    { key: CHROMA_SUBSAMPLING.CS422, label: '4:2:2' },
    { key: CHROMA_SUBSAMPLING.CS420, label: '4:2:0' },
    { key: CHROMA_SUBSAMPLING.CS411, label: '4:1:1' },
  ];

  const handleChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      value = value[0];
    }

    setJpegOptions({ quality: value });
  };
  return (
    <div className="flex flex-col gap-2">
      <Slider
        classNames={{
          base: 'max-w-md',
          label: 'text-sm',
        }}
        isDisabled={lossless}
        label={t('quality')}
        maxValue={100}
        minValue={0}
        renderValue={() => (
          <NumberInput
            aria-label={t('quality')}
            className="max-w-20"
            classNames={{
              inputWrapper: 'p-1 h-8 shadow-none',
              input: 'text-right',
            }}
            maxValue={100}
            minValue={0}
            size="sm"
            value={jpegOptions.quality}
            variant="underlined"
            onValueChange={(value) => setJpegOptions({ quality: value })}
          ></NumberInput>
        )}
        size="sm"
        step={1}
        value={jpegOptions.quality}
        onChange={handleChange}
      />
      <Select
        disallowEmptySelection
        classNames={{
          label: 'text-md',
        }}
        label={t('compression_options.chroma_subsampling')}
        labelPlacement="outside"
        selectedKeys={[jpegOptions.chromaSubsampling]}
        selectionMode="single"
        size="sm"
        variant="underlined"
        onSelectionChange={(value) =>
          setJpegOptions({ chromaSubsampling: (value.currentKey as CHROMA_SUBSAMPLING) || CHROMA_SUBSAMPLING.AUTO })
        }
      >
        {chromaSubsamplings.map((cs) => (
          <SelectItem key={cs.key}>{cs.label}</SelectItem>
        ))}
      </Select>
      <Checkbox
        disableAnimation
        isSelected={jpegOptions.progressive}
        size="sm"
        onValueChange={(value) => setJpegOptions({ progressive: value })}
      >
        {t('compression_options.progressive')}
      </Checkbox>
    </div>
  );
}

export default JpegOptions;
