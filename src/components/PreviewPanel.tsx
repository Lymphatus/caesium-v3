import {
  ReactZoomPanPinchHandlers,
  ReactZoomPanPinchState,
  TransformComponent,
  TransformWrapper,
  useTransformComponent,
} from 'react-zoom-pan-pinch';
import { Button, NumberInput, Slider, Spinner } from '@heroui/react';
import { Fullscreen, Maximize, Minus, Plus } from 'lucide-react';
import { RefObject, useCallback, useRef } from 'react';
import prettyBytes from 'pretty-bytes';
import PreviewCanvas from '@/components/PreviewCanvas.tsx';
import usePreviewStore from '@/stores/preview.store.ts';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

const TransformControls = ({ zoomIn, zoomOut }: Pick<ReactZoomPanPinchHandlers, 'zoomIn' | 'zoomOut'>) => {
  const setZoomLevel = (value: number | number[], state: ReactZoomPanPinchState) => {
    const newScale = (Array.isArray(value) ? value[0] : value) / 100;
    const zoomDiff = newScale - state.previousScale;
    const factor = Math.abs(zoomDiff);
    if (zoomDiff < 0) {
      zoomOut(factor);
    } else {
      zoomIn(factor);
    }
  };

  return useTransformComponent(({ state }) => {
    const zoomLevel: number = Math.round(state.scale * 100);
    return (
      <>
        <NumberInput
          disableAnimation
          hideStepper
          aria-label="zoom"
          className="max-w-20"
          classNames={{
            inputWrapper: 'p-1 h-8 shadow-none',
            input: 'text-right',
          }}
          endContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">%</span>
            </div>
          }
          maxValue={300}
          minValue={1}
          size="sm"
          value={zoomLevel}
          variant="faded"
          onValueChange={(value) => setZoomLevel(value, state)}
        ></NumberInput>
        <Button
          disableRipple
          isIconOnly
          size="sm"
          title={i18next.t('zoom_out')}
          variant="light"
          onPress={() => zoomOut()}
        >
          <Minus className="size-3"></Minus>
        </Button>
        <Slider
          aria-label="zoom"
          className="w-[150px]"
          maxValue={300}
          minValue={1}
          size="sm"
          value={zoomLevel}
          onChange={(value) => setZoomLevel(value, state)}
        ></Slider>
        <Button
          disableRipple
          isIconOnly
          size="sm"
          title={i18next.t('zoom_in')}
          variant="light"
          onPress={() => zoomIn()}
        >
          <Plus className="size-3"></Plus>
        </Button>
      </>
    );
  });
};

function PreviewPanel() {
  const { currentPreviewedCImage, isLoading } = usePreviewStore();
  const wrapperRef: RefObject<HTMLDivElement | null> = useRef(null);
  const contentRef: RefObject<HTMLDivElement | null> = useRef(null);
  const { t } = useTranslation();

  const fitContentToWrapper = useCallback((centerView: (scale: number) => void) => {
    if (wrapperRef.current && contentRef.current) {
      const wrapperWidth = wrapperRef.current.clientWidth;
      const wrapperHeight = wrapperRef.current.clientHeight;

      const contentWidth = contentRef.current.clientWidth;
      const contentHeight = contentRef.current.clientHeight;

      const widthScale = wrapperWidth / contentWidth;
      const heightScale = wrapperHeight / contentHeight;

      const scale = widthScale < heightScale ? widthScale : heightScale;

      centerView(scale);
    }
  }, []);

  return (
    <div className="bg-content1 relative size-full rounded-sm">
      <TransformWrapper
        centerOnInit
        centerZoomedOut
        disablePadding
        limitToBounds
        maxScale={3}
        minScale={0.01}
        smooth={false}
        zoomAnimation={{ disabled: true }}
      >
        {({ zoomIn, zoomOut, centerView }) => (
          <div
            ref={wrapperRef}
            className="bg-content2 flex size-full flex-col items-center justify-between rounded-t-sm rounded-b-sm"
          >
            {isLoading && (
              <Spinner
                className="absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform"
                // TODO hack to have the spinner centered, because we have 40px as the control bar height
                style={{
                  top: 'calc(50% - 20px)',
                }}
              ></Spinner>
            )}

            <TransformComponent wrapperClass="!w-full relative !h-full">
              <div ref={contentRef} className="size-full">
                <PreviewCanvas></PreviewCanvas>
              </div>
            </TransformComponent>

            <div className="bg-content1 flex h-[40px] w-full items-center justify-between rounded-b-sm p-1">
              <div>{currentPreviewedCImage && prettyBytes(currentPreviewedCImage.size)}</div>
              <div className="flex items-center gap-1">
                <Button
                  disableRipple
                  isIconOnly
                  size="sm"
                  title={t('fit_container')}
                  variant="light"
                  onPress={() => {
                    fitContentToWrapper(centerView);
                  }}
                >
                  <Fullscreen className="size-4"></Fullscreen>
                </Button>
                <Button
                  disableRipple
                  isIconOnly
                  size="sm"
                  title={t('actual_size')}
                  variant="light"
                  onPress={() => {
                    centerView(1);
                  }}
                >
                  <Maximize className="size-4"></Maximize>
                </Button>
                <TransformControls zoomIn={zoomIn} zoomOut={zoomOut}></TransformControls>
              </div>
            </div>
          </div>
        )}
      </TransformWrapper>
    </div>
  );
}

export default PreviewPanel;
