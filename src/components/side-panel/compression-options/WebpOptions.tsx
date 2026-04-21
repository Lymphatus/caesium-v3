import { NumberInput } from '@heroui/react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import useCompressionOptionsStore from '@/stores/compression-options.store.ts';

function WebpOptions() {
  const { t } = useTranslation();

  const { webpOptions, setWebpOptions } = useCompressionOptionsStore();

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
          isDisabled={webpOptions.lossless}
          maxValue={100}
          minValue={0}
          size="sm"
          value={webpOptions.quality}
          variant="faded"
          onValueChange={(value) => setWebpOptions({ quality: value })}
        ></NumberInput>
      </div>
      <Slider
        disabled={webpOptions.lossless}
        max={100}
        min={0}
        step={1}
        value={[webpOptions.quality]}
        onValueChange={([value]) => setWebpOptions({ quality: value })}
      />
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col">
          <span>{t('compression_options.lossless')}</span>
        </div>
        <Switch
          checked={webpOptions.lossless}
          onCheckedChange={(value) => setWebpOptions({ lossless: value })}
        ></Switch>
      </div>
    </div>
  );
}

export default WebpOptions;
