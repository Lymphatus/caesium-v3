import { RESIZE_MODE } from '@/types.ts';
import { Select, SelectItem } from '@heroui/react';
import { NumberInput } from '@/components/ui/number-input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import useResizeOptionsStore from '@/stores/resize-options.store.ts';

function ResizeOptions() {
  const { t } = useTranslation();
  const {
    resizeMode,
    width,
    height,
    widthPercentage,
    heightPercentage,
    dimension,
    keepAspectRatio,
    doNotEnlarge,
    setResizeMode,
    setWidth,
    setHeight,
    setWidthPercentage,
    setHeightPercentage,
    setDimension,
    setKeepAspectRatio,
    setDoNotEnlarge,
  } = useResizeOptionsStore();

  const resizeModes = [
    { key: RESIZE_MODE.NONE, label: t('resize_modes.none') },
    {
      key: RESIZE_MODE.DIMENSIONS,
      label: t('resize_modes.dimensions'),
    },
    {
      key: RESIZE_MODE.PERCENTAGE,
      label: t('resize_modes.percentage'),
    },
    {
      key: RESIZE_MODE.WIDTH,
      label: t('resize_modes.width'),
    },
    {
      key: RESIZE_MODE.HEIGHT,
      label: t('resize_modes.height'),
    },
    {
      key: RESIZE_MODE.LONG_EDGE,
      label: t('resize_modes.long_edge'),
    },
    {
      key: RESIZE_MODE.SHORT_EDGE,
      label: t('resize_modes.short_edge'),
    },
  ];

  const showPixelDimensionsInputs = [RESIZE_MODE.DIMENSIONS, RESIZE_MODE.WIDTH, RESIZE_MODE.HEIGHT].includes(
    resizeMode,
  );
  const showPercentageInputs = resizeMode === RESIZE_MODE.PERCENTAGE;
  const showDimensionInput = [RESIZE_MODE.LONG_EDGE, RESIZE_MODE.SHORT_EDGE].includes(resizeMode);
  const showResizeControls = resizeMode !== RESIZE_MODE.NONE;
  const keepAspectRatioDisabled = [
    RESIZE_MODE.DIMENSIONS,
    RESIZE_MODE.WIDTH,
    RESIZE_MODE.HEIGHT,
    RESIZE_MODE.LONG_EDGE,
    RESIZE_MODE.SHORT_EDGE,
  ].includes(resizeMode);

  let dimensionLabel = '';
  switch (resizeMode) {
    case RESIZE_MODE.LONG_EDGE:
      dimensionLabel = t('resize_modes.long_edge');
      break;
    case RESIZE_MODE.SHORT_EDGE:
      dimensionLabel = t('resize_modes.short_edge');
      break;
    case RESIZE_MODE.WIDTH:
      dimensionLabel = t('resize_modes.width');
      break;
    case RESIZE_MODE.HEIGHT:
      dimensionLabel = t('resize_modes.height');
      break;
    default:
      break;
  }

  return (
    <div className="size-full overflow-auto">
      <div className="flex flex-col gap-2 p-2 text-sm">
        <Select
          disallowEmptySelection
          classNames={{
            label: 'text-md',
            trigger: 'shadow-none',
            popoverContent: 'bg-content2 border-2 border-content1',
          }}
          label={t('compression_options.resize_options.resize_mode')}
          labelPlacement="outside"
          selectedKeys={[resizeMode]}
          selectionMode="single"
          size="sm"
          variant="faded"
          onSelectionChange={(value) => setResizeMode((value.currentKey as RESIZE_MODE) || RESIZE_MODE.NONE)}
        >
          {resizeModes.map((r) => (
            <SelectItem key={r.key}>{r.label}</SelectItem>
          ))}
        </Select>
        {showResizeControls && (
          <>
            {showPixelDimensionsInputs && (
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex flex-1 flex-col gap-1">
                  <Label>{t('width')}</Label>
                  <NumberInput
                    aria-label={t('width')}
                    disabled={resizeMode === RESIZE_MODE.HEIGHT}
                    endAdornment="px"
                    max={99999}
                    min={1}
                    size="sm"
                    value={width}
                    onValueChange={(value) => setWidth(value)}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <Label>{t('height')}</Label>
                  <NumberInput
                    aria-label={t('height')}
                    disabled={resizeMode === RESIZE_MODE.WIDTH}
                    endAdornment="px"
                    max={99999}
                    min={1}
                    size="sm"
                    value={height}
                    onValueChange={(value) => setHeight(value)}
                  />
                </div>
              </div>
            )}
            {showPercentageInputs && (
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex flex-1 flex-col gap-1">
                  <Label>{t('width')}</Label>
                  <NumberInput
                    aria-label={t('width')}
                    endAdornment="%"
                    max={doNotEnlarge ? 100 : 999}
                    min={1}
                    size="sm"
                    value={widthPercentage}
                    onValueChange={(value) => {
                      setWidthPercentage(value);
                      if (keepAspectRatio) {
                        setHeightPercentage(value);
                      }
                    }}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <Label>{t('height')}</Label>
                  <NumberInput
                    aria-label={t('height')}
                    endAdornment="%"
                    max={doNotEnlarge ? 100 : 999}
                    min={1}
                    size="sm"
                    value={heightPercentage}
                    onValueChange={(value) => {
                      setHeightPercentage(value);
                      if (keepAspectRatio) {
                        setWidthPercentage(value);
                      }
                    }}
                  />
                </div>
              </div>
            )}
            {showDimensionInput && (
              <div className="flex flex-col gap-1">
                <Label>{dimensionLabel}</Label>
                <NumberInput
                  aria-label={dimensionLabel}
                  endAdornment="px"
                  max={99999}
                  min={1}
                  size="sm"
                  value={dimension}
                  onValueChange={(value) => setDimension(value)}
                />
              </div>
            )}
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col">
                <Label htmlFor="switch-do-not-enlarge">{t('compression_options.resize_options.do_not_enlarge')}</Label>
              </div>
              <Switch
                checked={doNotEnlarge}
                id="switch-do-not-enlarge"
                onCheckedChange={(enabled) => {
                  setDoNotEnlarge(enabled);
                  if (enabled) {
                    if (widthPercentage > 100) {
                      setWidthPercentage(100);
                    }
                    if (heightPercentage > 100) {
                      setHeightPercentage(100);
                    }
                  }
                }}
              ></Switch>
            </div>

            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col">
                <Label htmlFor="switch-keep-aspect-ratio">
                  {t('compression_options.resize_options.keep_aspect_ratio')}
                </Label>
              </div>
              <Switch
                checked={keepAspectRatio}
                disabled={keepAspectRatioDisabled}
                id="switch-keep-aspect-ratio"
                onCheckedChange={(enabled) => {
                  setKeepAspectRatio(enabled);
                  if (enabled) {
                    setHeightPercentage(widthPercentage);
                  }
                }}
              ></Switch>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ResizeOptions;
