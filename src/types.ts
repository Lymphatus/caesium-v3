export type CImage = {
  id: string;
  name: string;
  path: string;
  directory: string;
  mime_type: string;
  size: number;
  width: number;
  height: number;

  compressed_width: number;
  compressed_height: number;
  compressed_size: number;
  compressed_file_path: string;
  info: string;
  status: IMAGE_STATUS;
};

export type ImageLoaderRequest = {
  mimeType: string;
  imageUrl: string;
  type: 'original' | 'compressed';
};

export type ImageLoaderResponse = {
  imageBitmap: ImageBitmap;
  type: 'original' | 'compressed';
};

export type AppPreferences = {
  uuid: string;
};

export enum IMAGE_STATUS {
  NEW = 0,
  SUCCESS = 1,
  WARNING = 2,
  ERROR = 3,
  COMPRESSING = -1,
}
export enum CHROMA_SUBSAMPLING {
  AUTO = 'auto',
  CS444 = '4:4:4',
  CS422 = '4:2:2',
  CS420 = '4:2:0',
  CS411 = '4:1:1',
}

export enum TIFF_COMPRESSION_METHOD {
  NONE = 'none',
  LZW = 'lzw',
  DEFLATE = 'deflate',
  PACKBITS = 'packbits',
}

export enum TIFF_DEFLATE_LEVEL {
  FAST,
  BALANCED,
  BEST,
}

export enum SIDE_PANEL_TAB {
  COMPRESSION = 'compression',
  OUTPUT = 'output',
  RESIZE = 'resize',
}

export enum MOVE_ORIGINAL_FILE {
  TRASH = 'trash',
  DELETE = 'delete',
}

export enum FILE_DATE {
  CREATED = 'created',
  MODIFIED = 'modified',
  ACCESSED = 'accessed',
}

export enum OUTPUT_FORMAT {
  ORIGINAL = 'original',
  JPEG = 'jpeg',
  PNG = 'png',
  TIFF = 'tiff',
  WEBP = 'webp',
}

export enum RESIZE_MODE {
  NONE = 'none',
  DIMENSIONS = 'dimensions',
  WIDTH = 'width',
  HEIGHT = 'height',
  LONG_EDGE = 'long_edge',
  SHORT_EDGE = 'short_edge',
  PERCENTAGE = 'percentage',
}

export enum COMPRESSION_MODE {
  QUALITY,
  SIZE,
}

export enum THEME {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum DIRECT_IMPORT_ACTION {
  IMPORT = 'import',
  IMPORT_COMPRESS = 'import_compress',
}

export enum POST_COMPRESSION_ACTION {
  NONE = 'none',
  CLOSE_APP = 'close_app',
  SLEEP = 'sleep',
  SHUTDOWN = 'shutdown',
  OPEN_OUTPUT_FOLDER = 'open_output_folder',
}
