import { MediaType } from 'src/helpers/constants/media';

export interface ITransformedFile {
  fileName: string;
  filePath: string;
  originalName: string;
  mimeType: string;
  mediaType: MediaType;
}
