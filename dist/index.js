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
        this.nextVal = '';
        this.lineNumber = -1;
        this.myFile = undefined;
        this.charset = 'utf8';
        this.eof = -1;
        // move to first line
        this.moveNext();
        this.moveNext();
        return this;
    }
    moveNext() {
        this.val = this.nextVal;
        let nextVal = this.next();
        if (nextVal === false) {
            this.eof++;
            nextVal = '';
        }
        this.nextVal = nextVal.toString(this.charset);
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
        return this;
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
        const compareFn = this.options.compareFn;
        const charset = this.options.charset;
        let stop = false;
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
        // debug(lineReader1.nextVal, lineReader2.nextVal, 'next', lineReader1.eof, lineReader2.eof);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQXNDO0FBQ3RDLG1DQUE2QztBQUc3QywwQ0FBMkM7QUFDM0MsaUNBQWtDO0FBRWxDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBRXhDLE1BQWEsWUFBYSxTQUFRLFVBQVU7SUFPMUMsWUFBWSxJQUF1QjtRQUNqQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBUHBCLFFBQUcsR0FBVyxFQUFFLENBQUM7UUFDakIsWUFBTyxHQUFXLEVBQUUsQ0FBQztRQUNyQixlQUFVLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDeEIsV0FBTSxHQUF1QixTQUFTLENBQUM7UUFDdkMsWUFBTyxHQUFRLE1BQU0sQ0FBQztRQUN0QixRQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFJZixxQkFBcUI7UUFDckIsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNoQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCxRQUFRO1FBQ04sSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBRXhCLElBQUksT0FBTyxHQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUU5QixJQUFJLE9BQU8sS0FBSyxLQUFLLEVBQUU7WUFDckIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ1gsT0FBTyxHQUFHLEVBQUUsQ0FBQztTQUNkO1FBRUQsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDbEIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ2xCLENBQUM7Q0FDRjtB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QUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUU7b0JBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7aUJBQ2pEO3FCQUFNO29CQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7aUJBQ2pEO2FBQ0Y7WUFFRCwwQkFBMEI7WUFDMUIsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ3hCO0lBQ0gsQ0FBQztDQUNGO0FBdkZELCtCQXVGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyBUZXh0RmlsZURpZmZPcHRpb24gfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IFBhdGhMaWtlIH0gZnJvbSAnZnMnO1xuXG5pbXBvcnQgTGluZUJ5TGluZSA9IHJlcXVpcmUoJ24tcmVhZGxpbmVzJyk7XG5pbXBvcnQgbXlEZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJyk7XG5cbmNvbnN0IGRlYnVnID0gbXlEZWJ1ZygndGV4dC1maWxlLWRpZmYnKTtcblxuZXhwb3J0IGNsYXNzIE15TGluZVJlYWRlciBleHRlbmRzIExpbmVCeUxpbmUge1xuICB2YWw6IHN0cmluZyA9ICcnO1xuICBuZXh0VmFsOiBzdHJpbmcgPSAnJztcbiAgbGluZU51bWJlcjogbnVtYmVyID0gLTE7XG4gIG15RmlsZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICBjaGFyc2V0OiBhbnkgPSAndXRmOCc7XG4gIGVvZjogbnVtYmVyID0gLTE7XG4gIGNvbnN0cnVjdG9yKGZpbGU6IFBhdGhMaWtlIHwgbnVtYmVyKSB7XG4gICAgc3VwZXIoZmlsZSwgbnVsbCk7XG5cbiAgICAvLyBtb3ZlIHRvIGZpcnN0IGxpbmVcbiAgICB0aGlzLm1vdmVOZXh0KCk7XG4gICAgdGhpcy5tb3ZlTmV4dCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIG1vdmVOZXh0KCk6IHN0cmluZyB7XG4gICAgdGhpcy52YWwgPSB0aGlzLm5leHRWYWw7XG5cbiAgICBsZXQgbmV4dFZhbDphbnkgPSB0aGlzLm5leHQoKTtcblxuICAgIGlmIChuZXh0VmFsID09PSBmYWxzZSkge1xuICAgICAgdGhpcy5lb2YrKztcbiAgICAgIG5leHRWYWwgPSAnJztcbiAgICB9XG4gICAgXG4gICAgdGhpcy5uZXh0VmFsID0gbmV4dFZhbC50b1N0cmluZyh0aGlzLmNoYXJzZXQpO1xuICAgIHRoaXMubGluZU51bWJlcisrO1xuICAgIHJldHVybiB0aGlzLnZhbDtcbiAgfVxufVxuXG4vKipcbiAqIGxpbmUgYnkgbGluZSBkaWZmIG9mIHR3byBmaWxlc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXh0RmlsZURpZmYgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBvcHRpb25zOiBUZXh0RmlsZURpZmZPcHRpb247XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucz86IFRleHRGaWxlRGlmZk9wdGlvbikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5vcHRpb25zID0gbmV3IFRleHRGaWxlRGlmZk9wdGlvbigpO1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5vcHRpb25zLCBvcHRpb25zKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBydW4gZGlmZlxuICAgKiBAcGFyYW0gIFN0cmluZyBmaWxlMSBwYXRoIHRvIGZpbGUgMVxuICAgKiBAcGFyYW0gIFN0cmluZyBmaWxlMiBwYXRoIHRvIGZpbGUgMlxuICAgKiBAcmV0dXJuIE9iamVjdCAgICAgICAgIHNlbGZcbiAgICovXG4gIGRpZmYoZmlsZTE6IHN0cmluZywgZmlsZTI6IHN0cmluZykge1xuICAgIGNvbnN0IGxpbmVSZWFkZXIxID0gbmV3IE15TGluZVJlYWRlcihmaWxlMSk7XG4gICAgY29uc3QgbGluZVJlYWRlcjIgPSBuZXcgTXlMaW5lUmVhZGVyKGZpbGUyKTtcbiAgICBjb25zdCBjb21wYXJlRm4gICA9IHRoaXMub3B0aW9ucy5jb21wYXJlRm47XG4gICAgY29uc3QgY2hhcnNldCAgICAgPSB0aGlzLm9wdGlvbnMuY2hhcnNldDtcblxuICAgIGxldCBzdG9wID0gZmFsc2U7XG5cbiAgICBsaW5lUmVhZGVyMS5jaGFyc2V0ID0gY2hhcnNldDtcbiAgICBsaW5lUmVhZGVyMi5jaGFyc2V0ID0gY2hhcnNldDtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuc2tpcEhlYWRlcikge1xuICAgICAgbGluZVJlYWRlcjEubW92ZU5leHQoKTtcbiAgICAgIGxpbmVSZWFkZXIyLm1vdmVOZXh0KCk7XG4gICAgfVxuXG4gICAgLy8gd2hpbGUgYm90aCBmaWxlcyBoYXMgdmFsaWQgdmFsLCBjaGVjayBmb3IgYWN0dWFsIGZhbHNlIHZhbHVlXG4gICAgd2hpbGUgKGxpbmVSZWFkZXIxLmVvZiA8IDIgJiYgbGluZVJlYWRlcjIuZW9mIDwgMikge1xuICAgICAgdGhpcy5kb0NvbXBhcmVMaW5lUmVhZGVyKGxpbmVSZWFkZXIxLCBsaW5lUmVhZGVyMik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBkb0NvbXBhcmVMaW5lUmVhZGVyKGxpbmVSZWFkZXIxOiBNeUxpbmVSZWFkZXIsIGxpbmVSZWFkZXIyOiBNeUxpbmVSZWFkZXIpIHtcbiAgICAvLyBmb3JFYWNoIGxpbmUgaW4gRmlsZTEsIGNvbXBhcmUgdG8gbGluZSBpbiBGaWxlMlxuICAgIGNvbnN0IGxpbmUxID0gbGluZVJlYWRlcjEudmFsO1xuICAgIGNvbnN0IGxpbmUyID0gbGluZVJlYWRlcjIudmFsO1xuICAgIGNvbnN0IGNtcCAgID0gdGhpcy5vcHRpb25zLmNvbXBhcmVGbihsaW5lMSwgbGluZTIpO1xuICAgIC8vIGRlYnVnKGxpbmVSZWFkZXIxLnZhbCwgbGluZVJlYWRlcjIudmFsLCBjbXApO1xuICAgIC8vIGRlYnVnKGxpbmVSZWFkZXIxLm5leHRWYWwsIGxpbmVSZWFkZXIyLm5leHRWYWwsICduZXh0JywgbGluZVJlYWRlcjEuZW9mLCBsaW5lUmVhZGVyMi5lb2YpO1xuXG4gICAgLy8gZW1pdCBvbiBjb21wYXJlZFxuICAgIHRoaXMuZW1pdCgnY29tcGFyZWQnLCBsaW5lMSwgbGluZTIsIGNtcCwgbGluZVJlYWRlcjEsIGxpbmVSZWFkZXIyKTtcblxuICAgIC8vIGVxdWFsczogaW5jciBib3RoIGZpbGVzIHRvIG5leHQgbGluZVxuICAgIGlmIChjbXAgPT09IDApIHtcbiAgICAgIGxpbmVSZWFkZXIxLm1vdmVOZXh0KCk7XG4gICAgICBsaW5lUmVhZGVyMi5tb3ZlTmV4dCgpO1xuICAgIH0gZWxzZSBpZiAoY21wID4gMCkge1xuICAgICAgLy8gbGluZTEgPiBsaW5lMjogbmV3IGxpbmUgZGV0ZWN0ZWRcbiAgICAgIGlmIChjbXAgPT09IDEpIHtcblxuICAgICAgICAvLyBpZiBmaWxlMiBlbmRlZCBiZWZvcmUgZmlsZTEsIHRoZW4gZmlsZTIgbG9zdCBsaW5lMVxuICAgICAgICAvLyBlbHNlIGZpbGUyIGhhcyBuZXcgbGluZVxuICAgICAgICBpZiAobGluZVJlYWRlcjIuZW9mID4gbGluZVJlYWRlcjEuZW9mKSB7XG4gICAgICAgICAgdGhpcy5lbWl0KCctJywgbGluZTEsIGxpbmVSZWFkZXIxLCBsaW5lUmVhZGVyMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5lbWl0KCcrJywgbGluZTIsIGxpbmVSZWFkZXIxLCBsaW5lUmVhZGVyMik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gaW5jciBGaWxlMiB0byBuZXh0IGxpbmVcbiAgICAgIGxpbmVSZWFkZXIyLm1vdmVOZXh0KCk7XG4gICAgfSBlbHNlIGlmIChjbXAgPCAwKSB7XG4gICAgICAvLyBsaW5lMSA8IGxpbmUyOiBkZWxldGVkIGxpbmVcbiAgICAgIGlmIChjbXAgPT09IC0xKSB7XG5cbiAgICAgICAgLy8gaWYgZmlsZTEgZW5kZWQgYmVmb3JlIGZpbGUyLCB0aGVuIGZpbGUyIGhhcyBuZXcgbGluZVxuICAgICAgICAvLyBlbHNlIGZpbGUxIGxvc3QgYSBsaW5lXG4gICAgICAgIGlmIChsaW5lUmVhZGVyMS5lb2YgPiBsaW5lUmVhZGVyMi5lb2YpIHtcbiAgICAgICAgICB0aGlzLmVtaXQoJysnLCBsaW5lMiwgbGluZVJlYWRlcjEsIGxpbmVSZWFkZXIyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmVtaXQoJy0nLCBsaW5lMSwgbGluZVJlYWRlcjEsIGxpbmVSZWFkZXIyKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBpbmNyIEZpbGUxIHRvIG5leHQgbGluZVxuICAgICAgbGluZVJlYWRlcjEubW92ZU5leHQoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==