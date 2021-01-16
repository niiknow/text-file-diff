import {EventEmitter} from 'events';

export class TextFileDiffOption {
  skipHeader: boolean = false;
  charset: any = 'utf8';
  compareFn(line1: string, line2: string) {
    return line1 > line2 ? 1 : (line1 < line2 ? -1 : 0);
  }
}
