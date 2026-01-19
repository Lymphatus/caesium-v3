import { RefObject, useEffect, useRef } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { CImage, ImageLoaderRequest, ImageLoaderResponse, RESIZE_MODE } from '@/types.ts';
import usePreviewStore from '@/stores/preview.store.ts';
import useUIStore from '@/stores/ui.store.ts';
import useResizeOptionsStore from '@/stores/resize-options.store.ts';
import { error } from '@tauri-apps/plugin-log';

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

const worker = new Worker(new URL('@/workers/image-loader.ts', import.meta.url));

function PreviewCanvas() {
  const canvasRef: RefObject<HTMLCanvasElement | null> = useRef(null);
  const compressedCanvasRef: RefObject<HTMLCanvasElement | null> = useRef(null);

  const { currentPreviewedCImage, visualizationMode, setIsLoading, setVisualizationMode } = usePreviewStore();
  const { showPreviewPanel } = useUIStore();

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
    if (!showPreviewPanel) {
      return;
    }
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
      setIsLoading(false); // TODO if we are loading original and preview, this is out of sync
    };
    worker.addEventListener('message', listener);

    return () => {
      worker.removeEventListener('message', listener);
      cleanupCanvases(null, null);
    };
  }, []);

  useEffect(() => {
    if (!showPreviewPanel) {
      return;
    }

    const originalCanvas = canvasRef.current;
    const compressedCanvas = compressedCanvasRef.current;
    if (!originalCanvas || !compressedCanvas) {
      return;
    }

    if (currentPreviewedCImage) {
      setIsLoading(true);
      if (visualizationMode === 'compressed' && !currentPreviewedCImage?.compressed_file_path) {
        setVisualizationMode('original');
      }
      cleanupCanvases(originalCanvas, compressedCanvas);

      const imageURL = convertFileSrc(currentPreviewedCImage.path);
      let compressedImageURL = '';
      if (currentPreviewedCImage?.compressed_file_path) {
        compressedImageURL = convertFileSrc(currentPreviewedCImage.compressed_file_path);

        const messagePayload: ImageLoaderRequest = {
          mimeType: currentPreviewedCImage.mime_type, // TODO if compressed, use compressed mime type
          imageUrl: compressedImageURL,
          type: 'compressed',
        };

        worker.postMessage(messagePayload);
      }
      const messagePayload: ImageLoaderRequest = {
        mimeType: currentPreviewedCImage.mime_type,
        imageUrl: imageURL,
        type: 'original',
      };

      worker.postMessage(messagePayload);
    }

    return () => {
      cleanupCanvases(originalCanvas, compressedCanvas);
    };
  }, [currentPreviewedCImage]);

  return (
    <>
      <canvas ref={canvasRef} className={visualizationMode !== 'original' ? 'hidden' : ''} />
      <canvas ref={compressedCanvasRef} className={visualizationMode !== 'compressed' ? 'hidden' : ''} />
    </>
  );
}

export default PreviewCanvas;
