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
          value={zoomLevel}
          disableAnimation
          endContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">%</span>
            </div>
          }
          classNames={{
            inputWrapper: 'p-1 h-8',
            input: 'text-right',
          }}
          aria-label="zoom"
          size="sm"
          minValue={1}
          maxValue={300}
          hideStepper
          className="max-w-20"
          onValueChange={(value) => setZoomLevel(value, state)}
        ></NumberInput>
        <Button size="sm" variant="light" onPress={() => zoomOut()} isIconOnly disableRipple>
          <Minus className="size-3"></Minus>
        </Button>
        <Slider
          minValue={1}
          maxValue={300}
          size="sm"
          className="w-[150px]"
          aria-label="zoom"
          value={zoomLevel}
          onChange={(value) => setZoomLevel(value, state)}
        ></Slider>
        <Button size="sm" variant="light" onPress={() => zoomIn()} isIconOnly disableRipple>
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
    <div className="bg-content1 size-full rounded-sm relative">
      <TransformWrapper
        centerOnInit
        centerZoomedOut
        disablePadding
        limitToBounds
        minScale={0.01}
        maxScale={3}
        smooth={false}
        zoomAnimation={{ disabled: true }}
      >
        {({ zoomIn, zoomOut, centerView }) => (
          <div
            className="flex flex-col items-center justify-between size-full bg-content2 rounded-t-sm rounded-b-none"
            ref={wrapperRef}
          >
            {isLoading && (
              <Spinner
                className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
                // TODO hack to have the spinner centered, because we have 40px as the control bar height
                style={{
                  top: 'calc(50% - 20px)',
                }}
              ></Spinner>
            )}

            <TransformComponent wrapperClass="!w-full relative !h-full">
              <div className="size-full" ref={contentRef}>
                <PreviewCanvas></PreviewCanvas>
              </div>
            </TransformComponent>

            <div className="flex justify-between w-full items-center p-1 h-[40px] bg-content1">
              <div>{currentPreviewedCImage && prettyBytes(currentPreviewedCImage.size)}</div>
              <div className="flex gap-1 items-center">
                <Button
                  disableRipple
                  isIconOnly
                  size="sm"
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
