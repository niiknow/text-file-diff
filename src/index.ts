import {EventEmitter} from 'events';
import {TextFileDiffOption} from './types';
import {PathLike} from 'fs';

import LineByLine = require('n-readlines');
import myDebug = require('debug');

const debug = myDebug('text-file-diff');

export class MyLineReader extends LineByLine {
  val: string = '';
  nextValue: string = '';
  lineNumber: number = -1;
  myFile: string | undefined = undefined;
  charset: any = 'utf8';
  eof: number = -1;
  constructor(file: PathLike | number) {
    super(file, null);

    // move to first line
    this.moveNext();
    this.moveNext();
  }

  moveNext(): string {
    this.val = this.nextValue;

    let nextValue: any = this.next();

    if (nextValue === false) {
      this.eof++;
      nextValue = '';
    }

    this.nextValue = nextValue.toString(this.charset);
    this.lineNumber++;
    return this.val;
  }
}

/**
 * line by line diff of two files
 */
export default class TextFileDiff extends EventEmitter {
  options: TextFileDiffOption;

  constructor(options?: TextFileDiffOption) {
    super();
    this.options = new TextFileDiffOption();
    Object.assign(this.options, options);
  }

  /**
   * run diff
   * @param  String file1 path to file 1
   * @param  String file2 path to file 2
   * @return Object         self
   */
  diff(file1: string, file2: string) {
    const lineReader1 = new MyLineReader(file1);
    const lineReader2 = new MyLineReader(file2);
    const {compareFn, charset} = this.options;

    lineReader1.charset = charset;
    lineReader2.charset = charset;

    if (this.options.skipHeader) {
      lineReader1.moveNext();
      lineReader2.moveNext();
    }

    // while both files has valid val, check for actual false value
    while (lineReader1.eof < 2 && lineReader2.eof < 2) {
      this.doCompareLineReader(lineReader1, lineReader2);
    }

    return this;
  }

  doCompareLineReader(lineReader1: MyLineReader, lineReader2: MyLineReader) {
    // forEach line in File1, compare to line in File2
    const line1 = lineReader1.val;
    const line2 = lineReader2.val;
    const cmp = this.options.compareFn(line1, line2);

    // debug(lineReader1.val, lineReader2.val, cmp);
    // debug(lineReader1.nextValue, lineReader2.nextValue, 'next', lineReader1.eof, lineReader2.eof);
    // emit on compared
    this.emit('compared', line1, line2, cmp, lineReader1, lineReader2);

    // equals: incr both files to next line
    if (cmp === 0) {
      lineReader1.moveNext();
      lineReader2.moveNext();
    } else if (cmp > 0) {
      // line1 > line2: new line detected
      if (cmp === 1) {
        // if file2 ended before file1, then file2 lost line1
        // else file2 has new line
        if (lineReader2.eof > lineReader1.eof) {
          this.emit('-', line1, lineReader1, lineReader2);
        } else {
          this.emit('+', line2, lineReader1, lineReader2);
        }
      }

      // incr File2 to next line
      lineReader2.moveNext();
    } else if (cmp < 0) {
      // line1 < line2: deleted line
      if (cmp === -1) {
        // if file1 ended before file2, then file2 has new line
        // else file1 lost a line
        if (lineReader1.eof > lineReader2.eof) {
          this.emit('+', line2, lineReader1, lineReader2);
        } else {
          this.emit('-', line1, lineReader1, lineReader2);
        }
      }

      // incr File1 to next line
      lineReader1.moveNext();
    }
  }
}
