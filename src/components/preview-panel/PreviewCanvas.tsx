import { RefObject, useEffect, useRef } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { CImage, ImageLoaderRequest, ImageLoaderResponse, RESIZE_MODE } from '@/types.ts';
import usePreviewStore from '@/stores/preview.store.ts';
import useResizeOptionsStore from '@/stores/resize-options.store.ts';
import { error } from '@tauri-apps/plugin-log';
import { useControls } from 'react-zoom-pan-pinch';

const setImageToCanvas = (
  canvas: HTMLCanvasElement | null,
  image: ImageBitmap,
  originalImage: CImage | null,
  resizeMode: RESIZE_MODE,
  type: 'original' | 'compressed',
) => {
  if (!canvas) {
    error('Canvas is not defined');
    return;
  }
  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  // TODO ignoring the DIMENSIONS resize mode for now, because it's not working properly
  if (type === 'compressed' && originalImage && resizeMode !== RESIZE_MODE.DIMENSIONS) {
    canvas.width = originalImage.width < image.width ? image.width : originalImage.width;
    canvas.height = originalImage.height < image.height ? image.height : originalImage.height;
  } else {
    canvas.width = image.width;
    canvas.height = image.height;
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
};

function PreviewCanvas() {
  const canvasRef: RefObject<HTMLCanvasElement | null> = useRef(null);
  const compressedCanvasRef: RefObject<HTMLCanvasElement | null> = useRef(null);
  const workerRef = useRef<Worker | null>(null);

  const { currentPreviewedCImage, visualizationMode, setIsLoading, setVisualizationMode } = usePreviewStore();

  const { centerView } = useControls();
  const centerViewRef = useRef(centerView);
  centerViewRef.current = centerView;

  const cleanupCanvases = (originalCanvas: HTMLCanvasElement | null, compressedCanvas: HTMLCanvasElement | null) => {
    if (originalCanvas === null) {
      originalCanvas = canvasRef.current;
    }
    const originalContext = originalCanvas?.getContext('2d');

    if (compressedCanvas === null) {
      compressedCanvas = compressedCanvasRef.current;
    }
    const compressedContext = compressedCanvas?.getContext('2d');

    if (originalCanvas && originalContext) {
      originalContext.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
    }
    if (compressedCanvas && compressedContext) {
      compressedContext.clearRect(0, 0, compressedCanvas.width, compressedCanvas.height);
    }
  };

  useEffect(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('@/workers/image-loader.ts', import.meta.url));
    }
    const worker = workerRef.current;
    const listener = (e: MessageEvent<ImageLoaderResponse>) => {
      const data = e.data;
      const canvas = data.type === 'compressed' ? compressedCanvasRef.current : canvasRef.current;
      setImageToCanvas(
        canvas,
        data.imageBitmap,
        usePreviewStore.getState().currentPreviewedCImage,
        useResizeOptionsStore.getState().resizeMode,
        data.type,
      );

      centerViewRef.current?.(undefined, 0);
      setIsLoading(false); // TODO if we are loading original and preview, this is out of sync
    };
    worker.addEventListener('message', listener);

    return () => {
      worker.removeEventListener('message', listener);
      worker.terminate();
      workerRef.current = null;
      cleanupCanvases(null, null);
    };
  }, [setIsLoading]);

  useEffect(() => {
    const originalCanvas = canvasRef.current;
    const compressedCanvas = compressedCanvasRef.current;
    if (!originalCanvas || !compressedCanvas) {
      return;
    }

    if (currentPreviewedCImage) {
      setIsLoading(true);
      if (
        usePreviewStore.getState().visualizationMode === 'compressed' &&
        !currentPreviewedCImage?.compressed_file_path
      ) {
        setVisualizationMode('original');
      }
      cleanupCanvases(originalCanvas, compressedCanvas);

      const imageURL = convertFileSrc(currentPreviewedCImage.path);
      if (currentPreviewedCImage?.compressed_file_path) {
        const compressedImageURL = convertFileSrc(currentPreviewedCImage.compressed_file_path);

        const messagePayload: ImageLoaderRequest = {
          mimeType: currentPreviewedCImage.mime_type, // TODO if compressed, use compressed mime type
          imageUrl: compressedImageURL,
          type: 'compressed',
        };

        workerRef.current?.postMessage(messagePayload);
      }
      const messagePayload: ImageLoaderRequest = {
        mimeType: currentPreviewedCImage.mime_type,
        imageUrl: imageURL,
        type: 'original',
      };

      workerRef.current?.postMessage(messagePayload);
    }

    return () => {
      cleanupCanvases(originalCanvas, compressedCanvas);
    };
  }, [currentPreviewedCImage, setVisualizationMode, setIsLoading]);

  return (
    <>
      <canvas ref={canvasRef} className={visualizationMode !== 'original' ? 'hidden' : ''} />
      <canvas ref={compressedCanvasRef} className={visualizationMode !== 'compressed' ? 'hidden' : ''} />
    </>
  );
}

export default PreviewCanvas;
