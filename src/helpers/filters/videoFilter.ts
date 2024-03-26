import { UnsupportedMediaTypeException } from '@nestjs/common';

type validFileExtension = 'mp4' | 'mov' | 'webm' | 'ogg';
type validMimeType = 'video/mp4' | 'video/mov' | 'video/webm' | 'video/ogg';

const validMimeTypes: validMimeType[] = [
  'video/mp4',
  'video/mov',
  'video/webm',
  'video/ogg',
];

const validFileExtensions: validFileExtension[] = ['mp4', 'mov', 'webm', 'ogg'];

export function videoFilter(req, file, cb) {
  if (
    !validFileExtensions.includes(
      file.originalname.split('.')[file.originalname.split('.').length - 1],
    )
  ) {
    cb(new UnsupportedMediaTypeException('Invalid file extension.'), false);
    return;
  }
  if (!validMimeTypes.includes(file.mimetype)) {
    cb(new UnsupportedMediaTypeException('Invalid mime type.'), false);
    return;
  }

  cb(null, true);
}
