import { NumberInput, Slider, Switch } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import useCompressionOptionsStore from '@/stores/compression-options.store.ts';

function WebpOptions() {
  const { t } = useTranslation();

  const { webpOptions, setWebpOptions } = useCompressionOptionsStore();

  const handleChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      value = value[0];
    }

    setWebpOptions({ quality: value });
  };

  return (
    <div className="flex flex-col gap-2">
      <Slider
        classNames={{
          label: 'text-sm',
        }}
        isDisabled={webpOptions.lossless}
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
            value={webpOptions.quality}
            variant="faded"
            onValueChange={(value) => setWebpOptions({ quality: value })}
          ></NumberInput>
        )}
        size="sm"
        step={1}
        value={webpOptions.quality}
        onChange={handleChange}
      />
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col">
          <span>{t('compression_options.lossless')}</span>
        </div>
        <Switch
          isSelected={webpOptions.lossless}
          size="sm"
          onValueChange={(value) => setWebpOptions({ lossless: value })}
        ></Switch>
      </div>
    </div>
  );
}

export default WebpOptions;
