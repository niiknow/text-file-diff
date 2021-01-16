"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyLineReader = void 0;
const events_1 = require("events");
const types_1 = require("./types");
const LineByLine = require("n-readlines");
const myDebug = require("debug");
const debug = myDebug('text-file-diff');
class MyLineReader extends LineByLine {
    constructor(file) {
        super(file, null);
        this.val = '';
        this.nextValue = '';
        this.lineNumber = -1;
        this.myFile = undefined;
        this.charset = 'utf8';
        this.eof = -1;
        // move to first line
        this.moveNext();
        this.moveNext();
    }
    moveNext() {
        this.val = this.nextValue;
        let nextValue = this.next();
        if (nextValue === false) {
            this.eof++;
            nextValue = '';
        }
        this.nextValue = nextValue.toString(this.charset);
        this.lineNumber++;
        return this.val;
    }
}
exports.MyLineReader = MyLineReader;
/**
 * line by line diff of two files
 */
class TextFileDiff extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.options = new types_1.TextFileDiffOption();
        Object.assign(this.options, options);
    }
    /**
     * run diff
     * @param  String file1 path to file 1
     * @param  String file2 path to file 2
     * @return Object         self
     */
    diff(file1, file2) {
        const lineReader1 = new MyLineReader(file1);
        const lineReader2 = new MyLineReader(file2);
        const { compareFn, charset } = this.options;
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
    doCompareLineReader(lineReader1, lineReader2) {
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
        }
        else if (cmp > 0) {
            // line1 > line2: new line detected
            if (cmp === 1) {
                // if file2 ended before file1, then file2 lost line1
                // else file2 has new line
                if (lineReader2.eof > lineReader1.eof) {
                    this.emit('-', line1, lineReader1, lineReader2);
                }
                else {
                    this.emit('+', line2, lineReader1, lineReader2);
                }
            }
            // incr File2 to next line
            lineReader2.moveNext();
        }
        else if (cmp < 0) {
            // line1 < line2: deleted line
            if (cmp === -1) {
                // if file1 ended before file2, then file2 has new line
                // else file1 lost a line
                if (lineReader1.eof > lineReader2.eof) {
                    this.emit('+', line2, lineReader1, lineReader2);
                }
                else {
                    this.emit('-', line1, lineReader1, lineReader2);
                }
            }
            // incr File1 to next line
            lineReader1.moveNext();
        }
    }
}
exports.default = TextFileDiff;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW9DO0FBQ3BDLG1DQUEyQztBQUczQywwQ0FBMkM7QUFDM0MsaUNBQWtDO0FBRWxDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBRXhDLE1BQWEsWUFBYSxTQUFRLFVBQVU7SUFPMUMsWUFBWSxJQUF1QjtRQUNqQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBUHBCLFFBQUcsR0FBVyxFQUFFLENBQUM7UUFDakIsY0FBUyxHQUFXLEVBQUUsQ0FBQztRQUN2QixlQUFVLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDeEIsV0FBTSxHQUF1QixTQUFTLENBQUM7UUFDdkMsWUFBTyxHQUFRLE1BQU0sQ0FBQztRQUN0QixRQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFJZixxQkFBcUI7UUFDckIsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNsQixDQUFDO0lBRUQsUUFBUTtRQUNOLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUUxQixJQUFJLFNBQVMsR0FBUSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFakMsSUFBSSxTQUFTLEtBQUssS0FBSyxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNYLFNBQVMsR0FBRyxFQUFFLENBQUM7U0FDaEI7UUFFRCxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNsQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDbEIsQ0FBQztDQUNGO0FBN0JELG9DQTZCQztBQUVEOztH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O3FCQUFNO29CQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7aUJBQ2pEO2FBQ0Y7WUFFRCwwQkFBMEI7WUFDMUIsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ3hCO0lBQ0gsQ0FBQztDQUNGO0FBakZELCtCQWlGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IHtUZXh0RmlsZURpZmZPcHRpb259IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHtQYXRoTGlrZX0gZnJvbSAnZnMnO1xuXG5pbXBvcnQgTGluZUJ5TGluZSA9IHJlcXVpcmUoJ24tcmVhZGxpbmVzJyk7XG5pbXBvcnQgbXlEZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJyk7XG5cbmNvbnN0IGRlYnVnID0gbXlEZWJ1ZygndGV4dC1maWxlLWRpZmYnKTtcblxuZXhwb3J0IGNsYXNzIE15TGluZVJlYWRlciBleHRlbmRzIExpbmVCeUxpbmUge1xuICB2YWw6IHN0cmluZyA9ICcnO1xuICBuZXh0VmFsdWU6IHN0cmluZyA9ICcnO1xuICBsaW5lTnVtYmVyOiBudW1iZXIgPSAtMTtcbiAgbXlGaWxlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIGNoYXJzZXQ6IGFueSA9ICd1dGY4JztcbiAgZW9mOiBudW1iZXIgPSAtMTtcbiAgY29uc3RydWN0b3IoZmlsZTogUGF0aExpa2UgfCBudW1iZXIpIHtcbiAgICBzdXBlcihmaWxlLCBudWxsKTtcblxuICAgIC8vIG1vdmUgdG8gZmlyc3QgbGluZVxuICAgIHRoaXMubW92ZU5leHQoKTtcbiAgICB0aGlzLm1vdmVOZXh0KCk7XG4gIH1cblxuICBtb3ZlTmV4dCgpOiBzdHJpbmcge1xuICAgIHRoaXMudmFsID0gdGhpcy5uZXh0VmFsdWU7XG5cbiAgICBsZXQgbmV4dFZhbHVlOiBhbnkgPSB0aGlzLm5leHQoKTtcblxuICAgIGlmIChuZXh0VmFsdWUgPT09IGZhbHNlKSB7XG4gICAgICB0aGlzLmVvZisrO1xuICAgICAgbmV4dFZhbHVlID0gJyc7XG4gICAgfVxuXG4gICAgdGhpcy5uZXh0VmFsdWUgPSBuZXh0VmFsdWUudG9TdHJpbmcodGhpcy5jaGFyc2V0KTtcbiAgICB0aGlzLmxpbmVOdW1iZXIrKztcbiAgICByZXR1cm4gdGhpcy52YWw7XG4gIH1cbn1cblxuLyoqXG4gKiBsaW5lIGJ5IGxpbmUgZGlmZiBvZiB0d28gZmlsZXNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGV4dEZpbGVEaWZmIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgb3B0aW9uczogVGV4dEZpbGVEaWZmT3B0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM/OiBUZXh0RmlsZURpZmZPcHRpb24pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMub3B0aW9ucyA9IG5ldyBUZXh0RmlsZURpZmZPcHRpb24oKTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogcnVuIGRpZmZcbiAgICogQHBhcmFtICBTdHJpbmcgZmlsZTEgcGF0aCB0byBmaWxlIDFcbiAgICogQHBhcmFtICBTdHJpbmcgZmlsZTIgcGF0aCB0byBmaWxlIDJcbiAgICogQHJldHVybiBPYmplY3QgICAgICAgICBzZWxmXG4gICAqL1xuICBkaWZmKGZpbGUxOiBzdHJpbmcsIGZpbGUyOiBzdHJpbmcpIHtcbiAgICBjb25zdCBsaW5lUmVhZGVyMSA9IG5ldyBNeUxpbmVSZWFkZXIoZmlsZTEpO1xuICAgIGNvbnN0IGxpbmVSZWFkZXIyID0gbmV3IE15TGluZVJlYWRlcihmaWxlMik7XG4gICAgY29uc3Qge2NvbXBhcmVGbiwgY2hhcnNldH0gPSB0aGlzLm9wdGlvbnM7XG5cbiAgICBsaW5lUmVhZGVyMS5jaGFyc2V0ID0gY2hhcnNldDtcbiAgICBsaW5lUmVhZGVyMi5jaGFyc2V0ID0gY2hhcnNldDtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuc2tpcEhlYWRlcikge1xuICAgICAgbGluZVJlYWRlcjEubW92ZU5leHQoKTtcbiAgICAgIGxpbmVSZWFkZXIyLm1vdmVOZXh0KCk7XG4gICAgfVxuXG4gICAgLy8gd2hpbGUgYm90aCBmaWxlcyBoYXMgdmFsaWQgdmFsLCBjaGVjayBmb3IgYWN0dWFsIGZhbHNlIHZhbHVlXG4gICAgd2hpbGUgKGxpbmVSZWFkZXIxLmVvZiA8IDIgJiYgbGluZVJlYWRlcjIuZW9mIDwgMikge1xuICAgICAgdGhpcy5kb0NvbXBhcmVMaW5lUmVhZGVyKGxpbmVSZWFkZXIxLCBsaW5lUmVhZGVyMik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBkb0NvbXBhcmVMaW5lUmVhZGVyKGxpbmVSZWFkZXIxOiBNeUxpbmVSZWFkZXIsIGxpbmVSZWFkZXIyOiBNeUxpbmVSZWFkZXIpIHtcbiAgICAvLyBmb3JFYWNoIGxpbmUgaW4gRmlsZTEsIGNvbXBhcmUgdG8gbGluZSBpbiBGaWxlMlxuICAgIGNvbnN0IGxpbmUxID0gbGluZVJlYWRlcjEudmFsO1xuICAgIGNvbnN0IGxpbmUyID0gbGluZVJlYWRlcjIudmFsO1xuICAgIGNvbnN0IGNtcCA9IHRoaXMub3B0aW9ucy5jb21wYXJlRm4obGluZTEsIGxpbmUyKTtcblxuICAgIC8vIGRlYnVnKGxpbmVSZWFkZXIxLnZhbCwgbGluZVJlYWRlcjIudmFsLCBjbXApO1xuICAgIC8vIGRlYnVnKGxpbmVSZWFkZXIxLm5leHRWYWx1ZSwgbGluZVJlYWRlcjIubmV4dFZhbHVlLCAnbmV4dCcsIGxpbmVSZWFkZXIxLmVvZiwgbGluZVJlYWRlcjIuZW9mKTtcbiAgICAvLyBlbWl0IG9uIGNvbXBhcmVkXG4gICAgdGhpcy5lbWl0KCdjb21wYXJlZCcsIGxpbmUxLCBsaW5lMiwgY21wLCBsaW5lUmVhZGVyMSwgbGluZVJlYWRlcjIpO1xuXG4gICAgLy8gZXF1YWxzOiBpbmNyIGJvdGggZmlsZXMgdG8gbmV4dCBsaW5lXG4gICAgaWYgKGNtcCA9PT0gMCkge1xuICAgICAgbGluZVJlYWRlcjEubW92ZU5leHQoKTtcbiAgICAgIGxpbmVSZWFkZXIyLm1vdmVOZXh0KCk7XG4gICAgfSBlbHNlIGlmIChjbXAgPiAwKSB7XG4gICAgICAvLyBsaW5lMSA+IGxpbmUyOiBuZXcgbGluZSBkZXRlY3RlZFxuICAgICAgaWYgKGNtcCA9PT0gMSkge1xuICAgICAgICAvLyBpZiBmaWxlMiBlbmRlZCBiZWZvcmUgZmlsZTEsIHRoZW4gZmlsZTIgbG9zdCBsaW5lMVxuICAgICAgICAvLyBlbHNlIGZpbGUyIGhhcyBuZXcgbGluZVxuICAgICAgICBpZiAobGluZVJlYWRlcjIuZW9mID4gbGluZVJlYWRlcjEuZW9mKSB7XG4gICAgICAgICAgdGhpcy5lbWl0KCctJywgbGluZTEsIGxpbmVSZWFkZXIxLCBsaW5lUmVhZGVyMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5lbWl0KCcrJywgbGluZTIsIGxpbmVSZWFkZXIxLCBsaW5lUmVhZGVyMik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gaW5jciBGaWxlMiB0byBuZXh0IGxpbmVcbiAgICAgIGxpbmVSZWFkZXIyLm1vdmVOZXh0KCk7XG4gICAgfSBlbHNlIGlmIChjbXAgPCAwKSB7XG4gICAgICAvLyBsaW5lMSA8IGxpbmUyOiBkZWxldGVkIGxpbmVcbiAgICAgIGlmIChjbXAgPT09IC0xKSB7XG4gICAgICAgIC8vIGlmIGZpbGUxIGVuZGVkIGJlZm9yZSBmaWxlMiwgdGhlbiBmaWxlMiBoYXMgbmV3IGxpbmVcbiAgICAgICAgLy8gZWxzZSBmaWxlMSBsb3N0IGEgbGluZVxuICAgICAgICBpZiAobGluZVJlYWRlcjEuZW9mID4gbGluZVJlYWRlcjIuZW9mKSB7XG4gICAgICAgICAgdGhpcy5lbWl0KCcrJywgbGluZTIsIGxpbmVSZWFkZXIxLCBsaW5lUmVhZGVyMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5lbWl0KCctJywgbGluZTEsIGxpbmVSZWFkZXIxLCBsaW5lUmVhZGVyMik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gaW5jciBGaWxlMSB0byBuZXh0IGxpbmVcbiAgICAgIGxpbmVSZWFkZXIxLm1vdmVOZXh0KCk7XG4gICAgfVxuICB9XG59XG4iXX0=