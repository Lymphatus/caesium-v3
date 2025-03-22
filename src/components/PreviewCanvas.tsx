import { RefObject, useEffect, useRef } from 'react';
import { useWorker } from '@koale/useworker';
import { convertFileSrc } from '@tauri-apps/api/core';
import { CImage } from '@/types.ts';
import usePreviewStore from '@/stores/preview.store.ts';

const loadImage = async (fileURL: string) => {
  const response = await fetch(fileURL);
  const blob = await response.blob();
  return await createImageBitmap(blob);
};

function PreviewCanvas() {
  const canvasRef: RefObject<HTMLCanvasElement | null> = useRef(null);
  const { currentPreviewedCImage, setIsLoading } = usePreviewStore();

  const [imageLoaderWorker] = useWorker(loadImage);

  const runImageLoader = async (cImage: CImage) => {
    const fileURL = convertFileSrc(cImage.path);
    return await imageLoaderWorker(fileURL); // non-blocking UI
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    async function load(cImage: CImage) {
      return await runImageLoader(cImage);
    }

    if (currentPreviewedCImage && canvas) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      setIsLoading(true);
      load(currentPreviewedCImage)
        .then((image) => {
          canvas.width = image.width;
          canvas.height = image.height;
          context.drawImage(image, 0, 0);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setIsLoading(false);
        });
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
