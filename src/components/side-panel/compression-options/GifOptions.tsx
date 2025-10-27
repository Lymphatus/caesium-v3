import { NumberInput, Slider } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import useCompressionOptionsStore from '@/stores/compression-options.store.ts';

function GifOptions() {
  const { t } = useTranslation();

  const { gifOptions, setGifOptions } = useCompressionOptionsStore();

  const handleChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      value = value[0];
    }

    setGifOptions({ quality: value });
  };

  return (
    <div className="flex flex-col gap-2">
      <Slider
        classNames={{
          label: 'text-sm',
        }}
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
            value={gifOptions.quality}
            variant="faded"
            onValueChange={(value) => setGifOptions({ quality: value })}
          ></NumberInput>
        )}
        size="sm"
        step={1}
        value={gifOptions.quality}
        onChange={handleChange}
      />
    </div>
  );
}

export default GifOptions;
