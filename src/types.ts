export type CImage = {
  id: string;
  name: string;
  path: string;
  directory: string;
  mime_type: string;
  size: number;
  width: number;
  height: number;
};

export type ImageLoaderRequest = {
  mimeType: string;
  imageUrl: string;
};

export type ImageLoaderResponse = {
  imageBitmap: ImageBitmap;
};
