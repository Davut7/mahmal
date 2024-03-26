import { UnsupportedMediaTypeException } from '@nestjs/common';

type validFileExtension = 'png' | 'jpg' | 'jpeg';
type validMimeType = 'image/png' | 'image/jpg' | 'image/jpeg';

const validMimeTypes: validMimeType[] = [
  'image/png',
  'image/jpg',
  'image/jpeg',
];

const validFileExtensions: validFileExtension[] = ['jpeg', 'png', 'jpg'];

export function imageFilter(req, file, cb) {
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
