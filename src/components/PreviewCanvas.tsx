import { RefObject, useEffect, useRef } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { ImageLoaderRequest, ImageLoaderResponse } from '@/types.ts';
import usePreviewStore from '@/stores/preview.store.ts';
import useUIStore from '@/stores/ui.store.ts';

const worker = new Worker(new URL('@/workers/image-loader.ts', import.meta.url));

const setImageToCanvas = (canvas: HTMLCanvasElement | null, image: ImageBitmap) => {
  if (!canvas) {
    console.error('Canvas is not defined');
    return;
  }
  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0);
};

function PreviewCanvas() {
  const canvasRef: RefObject<HTMLCanvasElement | null> = useRef(null);
  const compressedCanvasRef: RefObject<HTMLCanvasElement | null> = useRef(null);

  const { currentPreviewedCImage, visualizationMode, setIsLoading, setVisualizationMode, invokePreview } =
    usePreviewStore();
  const { showPreviewPanel, autoPreview } = useUIStore();

  useEffect(() => {
    if (!showPreviewPanel) {
      return;
    }
    const listener = (e: MessageEvent<ImageLoaderResponse>) => {
      const data = e.data;
      const canvas = data.type === 'compressed' ? compressedCanvasRef.current : canvasRef.current;
      setImageToCanvas(canvas, data.imageBitmap);

      setIsLoading(false); // TODO if we are loading original and preview, this is out of sync
    };
    worker.addEventListener('message', listener);

    return () => {
      worker.removeEventListener('message', listener);
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
    const originalContext = originalCanvas.getContext('2d');
    const compressedContext = compressedCanvas.getContext('2d');
    if (!originalContext || !compressedContext) {
      return;
    }

    if (currentPreviewedCImage) {
      setIsLoading(true);
      if (autoPreview) {
        invokePreview(currentPreviewedCImage);
      }
      if (visualizationMode === 'compressed' && !currentPreviewedCImage?.compressed_file_path) {
        setVisualizationMode('original');
      }
      originalContext.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
      compressedContext.clearRect(0, 0, compressedCanvas.width, compressedCanvas.height);

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
      originalContext.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
      compressedContext.clearRect(0, 0, compressedCanvas.width, compressedCanvas.height);
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
