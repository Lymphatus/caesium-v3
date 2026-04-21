import { NumberInput } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import useCompressionOptionsStore from '@/stores/compression-options.store.ts';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

function GifOptions() {
  const { t } = useTranslation();

  const { gifOptions, setGifOptions } = useCompressionOptionsStore();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>{t('quality')}</Label>
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
      </div>
      <Slider
        max={100}
        min={0}
        step={1}
        value={[gifOptions.quality]}
        onValueChange={([value]) => setGifOptions({ quality: value })}
      />
    </div>
  );
}

export default GifOptions;
