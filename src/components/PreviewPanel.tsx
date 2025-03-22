import { convertFileSrc } from '@tauri-apps/api/core';
import useFileListStore from '@/stores/file-list.store.ts';
import {
  ReactZoomPanPinchHandlers,
  ReactZoomPanPinchState,
  TransformComponent,
  TransformWrapper,
  useTransformComponent,
} from 'react-zoom-pan-pinch';
import { Button, NumberInput, Slider } from '@heroui/react';
import { Fullscreen, Maximize, Minus, Plus } from 'lucide-react';
import { RefObject, useCallback, useRef } from 'react';
import prettyBytes from 'pretty-bytes';

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
          minValue={10}
          maxValue={800}
          hideStepper
          className="max-w-20"
          onValueChange={(value) => setZoomLevel(value, state)}
        ></NumberInput>
        <Button size="sm" variant="light" onPress={() => zoomOut()} isIconOnly disableRipple>
          <Minus className="size-3"></Minus>
        </Button>
        <Slider
          minValue={10}
          maxValue={800}
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
  const { currentPreviewedCImage } = useFileListStore();
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
    <div className="size-full">
      <div className="bg-content1 size-full rounded-sm">
        <div className="size-full relative">
          <TransformWrapper
            centerOnInit
            centerZoomedOut
            disablePadding
            limitToBounds
            minScale={0.1}
            maxScale={8}
            smooth={false}
            zoomAnimation={{ disabled: true }}
          >
            {({ zoomIn, zoomOut, centerView }) => (
              <div className="flex flex-col items-center justify-between size-full" ref={wrapperRef}>
                <TransformComponent wrapperClass="flex-1 bg-content2 rounded-t-sm rounded-b-none">
                  {currentPreviewedCImage?.path && (
                    <div className="size-full" ref={contentRef}>
                      <img src={convertFileSrc(currentPreviewedCImage.path)} alt="preview" />
                    </div>
                  )}
                </TransformComponent>
                <div className="flex justify-between w-full items-center p-1">
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
      </div>
    </div>
  );
}

export default PreviewPanel;
