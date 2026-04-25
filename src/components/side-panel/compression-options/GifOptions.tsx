import { useTranslation } from 'react-i18next';
import useCompressionOptionsStore from '@/stores/compression-options.store.ts';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';

function GifOptions() {
  const { t } = useTranslation();

  const { gifOptions, setGifOptions } = useCompressionOptionsStore();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>{t('quality')}</Label>
        <NumberInput
          aria-label={t('quality')}
          className="max-w-32"
          max={100}
          min={0}
          size="sm"
          value={gifOptions.quality}
          onValueChange={(value) => setGifOptions({ quality: value })}
        />
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
