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

export enum CHROMA_SUBSAMPLING {
  AUTO = 'auto',
  CS444 = '4:4:4',
  CS422 = '4:2:2',
  CS420 = '4:2:0',
  CS411 = '4:1:1',
}
