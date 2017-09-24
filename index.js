const EventEmitter = require('events');
const ReadlinesSync = require('n-readlines');

/**
 * default line comparer
 * @param  String line1
 * @param  String line2
 * @return Number       0 for equals, 1 if line1 > line2 or -1
 */
function defaultLineComparer(line1, line2) {
  line1 = String(line1).trim();
  line2 = String(line2).trim();
  return line1 > line2 ? 1 : (line1 < line2 ? -1 : 0);
}

/**
 * custom line reader for better control of file
 * @param  String file path of file
 * @return Object      custom linereader
 */
function myLineReader(file) {
  const rst = new ReadlinesSync(file);
  rst.val = null;
  rst.nextVal = null;
  rst.lineNumber = -1;

  rst.moveNext = () => {
    rst.val = rst.nextVal;
    rst.nextVal = rst.next();
    rst.lineNumber++;
    return rst.val;
  };

  // set current and next val
  rst.moveNext();
  rst.moveNext();

  return rst;
}

/**
 * line by line diff of two files
 */
class FileDiffLine extends EventEmitter {
  /**
   * initialize FileDiff
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  constructor(options) {
    super();
    Object.assign(this, options);
  }

  /**
   * run diff
   * @param  String file1 path to file 1
   * @param  String file2 path to file 2
   * @return Object this
   */
  diff(file1, file2) {
    const lineReader1 = myLineReader(file1);
    const lineReader2 = myLineReader(file2);
    const compareFn = this.compareFn || defaultLineComparer;
    const charset = this.charset || 'utf8';

    if (this.skipHeader) {
      lineReader1.moveNext();
      lineReader2.moveNext();
    }

    // while both files has valid val
    while (lineReader1.val || lineReader2.val) {
      // foreach line of file1, compare each line of file2
      const line1 = lineReader1.val.toString(charset);
      const line2 = lineReader2.val.toString(charset);
      const cmp = compareFn(line1, line2);

      // emit on compared
      this.emit('compared', line1, line2, cmp, lineReader1, lineReader2);

      // equals: so both inc both lines position
      if (cmp === 0) {
        lineReader1.moveNext();
        lineReader2.moveNext();
      } else if (cmp > 0) {
        // line1 > line2: must be new line in file2
        if (cmp === 1) {
          this.emit('+', line2, lineReader1, lineReader2);
        }

        // inc file2 to next line
        lineReader2.moveNext();
      } else if (cmp < 0) {
        // line1 < line2: must be new line in file2
        if (cmp === -1) {
          this.emit('-', line1, lineReader1, lineReader2);
        }

        // inc file1 to next line
        lineReader1.moveNext();
      }
    }

    return this;
  }
}

module.exports = FileDiffLine;
