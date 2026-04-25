import { NumberInput } from '@/components/ui/number-input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import useCompressionOptionsStore from '@/stores/compression-options.store.ts';

function PngOptions() {
  const { t } = useTranslation();

  const { pngOptions, setPngOptions } = useCompressionOptionsStore();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>{t('quality')}</Label>
        <NumberInput
          aria-label={t('quality')}
          className="max-w-32"
          disabled={pngOptions.optimize}
          max={100}
          min={0}
          size="sm"
          value={pngOptions.quality}
          onValueChange={(value) => setPngOptions({ quality: value })}
        />
      </div>
      <Slider
        disabled={pngOptions.optimize}
        max={100}
        min={0}
        step={1}
        value={[pngOptions.quality]}
        onValueChange={([value]) => setPngOptions({ quality: value })}
      />

      <div className="flex items-center justify-between">
        <Label>{t('compression_options.optimization_level')}</Label>
        <NumberInput
          aria-label={t('compression_options.optimization_level')}
          className="max-w-32"
          disabled={!pngOptions.optimize}
          max={6}
          min={1}
          size="sm"
          value={pngOptions.optimizationLevel}
          onValueChange={(value) => setPngOptions({ optimizationLevel: value })}
        />
      </div>
      <Slider
        disabled={!pngOptions.optimize}
        max={6}
        min={1}
        step={1}
        value={[pngOptions.optimizationLevel]}
        onValueChange={([value]) => setPngOptions({ optimizationLevel: value })}
      />
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col">
          <Label htmlFor="switch-png-optimize">{t('compression_options.lossless')}</Label>
        </div>
        <Switch
          checked={pngOptions.optimize}
          id="switch-png-optimize"
          onCheckedChange={(value) => setPngOptions({ optimize: value })}
        ></Switch>
      </div>
    </div>
  );
}

export default PngOptions;
