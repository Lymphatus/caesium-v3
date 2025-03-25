import { RefObject, useEffect, useRef } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { ImageLoaderRequest, ImageLoaderResponse } from '@/types.ts';
import usePreviewStore from '@/stores/preview.store.ts';

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
  const { currentPreviewedCImage, setIsLoading } = usePreviewStore();

  useEffect(() => {
    const listener = (e: MessageEvent<ImageLoaderResponse>) => {
      const data = e.data;
      setImageToCanvas(canvasRef.current, data.imageBitmap);

      setIsLoading(false);
    };
    worker.addEventListener('message', listener);

    return () => {
      worker.removeEventListener('message', listener);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    if (currentPreviewedCImage) {
      setIsLoading(true);
      context.clearRect(0, 0, canvas.width, canvas.height);

      const imageURL = convertFileSrc(currentPreviewedCImage.path);
      const messagePayload: ImageLoaderRequest = {
        mimeType: currentPreviewedCImage.mime_type,
        imageUrl: imageURL,
      };

      worker.postMessage(messagePayload);
    }

    return () => {
      console.log('cleanup');
    };
  }, [currentPreviewedCImage]);

  return (
    <>
      <canvas ref={canvasRef} />
    </>
  );
}

export default PreviewCanvas;
