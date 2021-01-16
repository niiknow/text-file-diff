"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamLineReader = void 0;
const events_1 = require("events");
const types_1 = require("./types");
const fs_1 = require("fs");
const readline_1 = require("readline");
const myDebug = require("debug");
const debug = myDebug('text-file-diff');
class StreamLineReader {
    constructor() {
        this.value = '';
        this.nextValue = '';
        this.lineNumber = -1;
        this.charset = 'utf8';
        this.eof = -1;
    }
    async init(readStream) {
        const rl = readline_1.createInterface({
            input: readStream,
            crlfDelay: Number.POSITIVE_INFINITY
        });
        this.it = rl[Symbol.asyncIterator]();
        // move to first line
        await this.moveNext();
        await this.moveNext();
        return this;
    }
    async moveNext() {
        this.value = this.nextValue;
        const nextResult = await this.it.next();
        if (nextResult.done) {
            this.eof++;
            nextResult.value = '';
        }
        this.nextValue = nextResult.value;
        this.lineNumber++;
        return this.value;
    }
}
exports.StreamLineReader = StreamLineReader;
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
    async diff(file1, file2) {
        const stream1 = fs_1.createReadStream(file1);
        const stream2 = fs_1.createReadStream(file2);
        return this.diffStream(stream1, stream2);
    }
    /**
     * run diffStream
     * @param  Readable stream1
     * @param  Readable stream2
     * @return Object         self
     */
    async diffStream(stream1, stream2) {
        const lineReader1 = await (new StreamLineReader()).init(stream1);
        const lineReader2 = await (new StreamLineReader()).init(stream2);
        const { compareFn, charset } = this.options;
        lineReader1.charset = charset;
        lineReader2.charset = charset;
        if (this.options.skipHeader) {
            await lineReader1.moveNext();
            await lineReader2.moveNext();
        }
        /* eslint-disable no-await-in-loop */
        // while both files has valid val, check for actual false value
        while (lineReader1.eof < 2 && lineReader2.eof < 2) {
            await this.doCompareLineReader(lineReader1, lineReader2);
        }
        /* eslint-enable no-await-in-loop */
        return this;
    }
    async doCompareLineReader(lineReader1, lineReader2) {
        // forEach line in File1, compare to line in File2
        const line1 = lineReader1.value;
        const line2 = lineReader2.value;
        const cmp = this.options.compareFn(line1, line2);
        // debug(line1, line1, cmp);
        // debug(lineReader1.nextValue, lineReader2.nextValue, 'next', lineReader1.eof, lineReader2.eof);
        // emit on compared
        this.emit('compared', line1, line2, cmp, lineReader1, lineReader2);
        // equals: incr both files to next line
        if (cmp === 0) {
            await lineReader1.moveNext();
            await lineReader2.moveNext();
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
            await lineReader2.moveNext();
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
            await lineReader1.moveNext();
        }
    }
}
exports.default = TextFileDiff;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW9DO0FBQ3BDLG1DQUEyQztBQUMzQywyQkFBOEM7QUFDOUMsdUNBQW9EO0FBR3BELGlDQUFrQztBQUVsQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUV4QyxNQUFhLGdCQUFnQjtJQUE3QjtRQUNFLFVBQUssR0FBVyxFQUFFLENBQUM7UUFDbkIsY0FBUyxHQUFXLEVBQUUsQ0FBQztRQUN2QixlQUFVLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDeEIsWUFBTyxHQUFRLE1BQU0sQ0FBQztRQUV0QixRQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUM7SUE2Qm5CLENBQUM7SUE1QkMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUEyQjtRQUNwQyxNQUFNLEVBQUUsR0FBRywwQkFBZSxDQUFDO1lBQ3pCLEtBQUssRUFBRSxVQUFVO1lBQ2pCLFNBQVMsRUFBRSxNQUFNLENBQUMsaUJBQWlCO1NBQ3BDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO1FBRXJDLHFCQUFxQjtRQUNyQixNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN0QixNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUV0QixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxLQUFLLENBQUMsUUFBUTtRQUNaLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUU1QixNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFeEMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFO1lBQ25CLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNYLFVB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QkFDYixxREFBcUQ7Z0JBQ3JELDBCQUEwQjtnQkFDMUIsSUFBSSxXQUFXLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUU7b0JBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7aUJBQ2pEO3FCQUFNO29CQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7aUJBQ2pEO2FBQ0Y7WUFFRCwwQkFBMEI7WUFDMUIsTUFBTSxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDOUI7YUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7WUFDbEIsOEJBQThCO1lBQzlCLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFO2dCQUNkLHVEQUF1RDtnQkFDdkQseUJBQXlCO2dCQUN6QixJQUFJLFdBQVcsQ0FBQyxHQUFHLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRTtvQkFDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztpQkFDakQ7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztpQkFDakQ7YUFDRjtZQUVELDBCQUEwQjtZQUMxQixNQUFNLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUM5QjtJQUNILENBQUM7Q0FDRjtBQS9GRCwrQkErRkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCB7VGV4dEZpbGVEaWZmT3B0aW9ufSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7UGF0aExpa2UsIGNyZWF0ZVJlYWRTdHJlYW19IGZyb20gJ2ZzJztcbmltcG9ydCB7SW50ZXJmYWNlLCBjcmVhdGVJbnRlcmZhY2V9IGZyb20gJ3JlYWRsaW5lJztcbmltcG9ydCBzdHJlYW0gZnJvbSAnc3RyZWFtJztcblxuaW1wb3J0IG15RGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpO1xuXG5jb25zdCBkZWJ1ZyA9IG15RGVidWcoJ3RleHQtZmlsZS1kaWZmJyk7XG5cbmV4cG9ydCBjbGFzcyBTdHJlYW1MaW5lUmVhZGVyIHtcbiAgdmFsdWU6IHN0cmluZyA9ICcnO1xuICBuZXh0VmFsdWU6IHN0cmluZyA9ICcnO1xuICBsaW5lTnVtYmVyOiBudW1iZXIgPSAtMTtcbiAgY2hhcnNldDogYW55ID0gJ3V0ZjgnO1xuICBpdD86IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxzdHJpbmc+O1xuICBlb2Y6IG51bWJlciA9IC0xO1xuICBhc3luYyBpbml0KHJlYWRTdHJlYW06IHN0cmVhbS5SZWFkYWJsZSk6IFByb21pc2U8U3RyZWFtTGluZVJlYWRlcj4ge1xuICAgIGNvbnN0IHJsID0gY3JlYXRlSW50ZXJmYWNlKHtcbiAgICAgIGlucHV0OiByZWFkU3RyZWFtLFxuICAgICAgY3JsZkRlbGF5OiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFlcbiAgICB9KTtcbiAgICB0aGlzLml0ID0gcmxbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG5cbiAgICAvLyBtb3ZlIHRvIGZpcnN0IGxpbmVcbiAgICBhd2FpdCB0aGlzLm1vdmVOZXh0KCk7XG4gICAgYXdhaXQgdGhpcy5tb3ZlTmV4dCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhc3luYyBtb3ZlTmV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHRoaXMudmFsdWUgPSB0aGlzLm5leHRWYWx1ZTtcblxuICAgIGNvbnN0IG5leHRSZXN1bHQgPSBhd2FpdCB0aGlzLml0Lm5leHQoKTtcblxuICAgIGlmIChuZXh0UmVzdWx0LmRvbmUpIHtcbiAgICAgIHRoaXMuZW9mKys7XG4gICAgICBuZXh0UmVzdWx0LnZhbHVlID0gJyc7XG4gICAgfVxuXG4gICAgdGhpcy5uZXh0VmFsdWUgPSBuZXh0UmVzdWx0LnZhbHVlO1xuICAgIHRoaXMubGluZU51bWJlcisrO1xuICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICB9XG59XG5cbi8qKlxuICogbGluZSBieSBsaW5lIGRpZmYgb2YgdHdvIGZpbGVzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRleHRGaWxlRGlmZiBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIG9wdGlvbnM6IFRleHRGaWxlRGlmZk9wdGlvbjtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zPzogVGV4dEZpbGVEaWZmT3B0aW9uKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBuZXcgVGV4dEZpbGVEaWZmT3B0aW9uKCk7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIHJ1biBkaWZmXG4gICAqIEBwYXJhbSAgU3RyaW5nIGZpbGUxIHBhdGggdG8gZmlsZSAxXG4gICAqIEBwYXJhbSAgU3RyaW5nIGZpbGUyIHBhdGggdG8gZmlsZSAyXG4gICAqIEByZXR1cm4gT2JqZWN0ICAgICAgICAgc2VsZlxuICAgKi9cbiAgYXN5bmMgZGlmZihmaWxlMTogc3RyaW5nLCBmaWxlMjogc3RyaW5nKSB7XG4gICAgY29uc3Qgc3RyZWFtMSA9IGNyZWF0ZVJlYWRTdHJlYW0oZmlsZTEpO1xuICAgIGNvbnN0IHN0cmVhbTIgPSBjcmVhdGVSZWFkU3RyZWFtKGZpbGUyKTtcbiAgICByZXR1cm4gdGhpcy5kaWZmU3RyZWFtKHN0cmVhbTEsIHN0cmVhbTIpO1xuICB9XG5cbiAgLyoqXG4gICAqIHJ1biBkaWZmU3RyZWFtXG4gICAqIEBwYXJhbSAgUmVhZGFibGUgc3RyZWFtMVxuICAgKiBAcGFyYW0gIFJlYWRhYmxlIHN0cmVhbTJcbiAgICogQHJldHVybiBPYmplY3QgICAgICAgICBzZWxmXG4gICAqL1xuICBhc3luYyBkaWZmU3RyZWFtKHN0cmVhbTE6IHN0cmVhbS5SZWFkYWJsZSwgc3RyZWFtMjogc3RyZWFtLlJlYWRhYmxlKSB7XG4gICAgY29uc3QgbGluZVJlYWRlcjEgPSBhd2FpdCAobmV3IFN0cmVhbUxpbmVSZWFkZXIoKSkuaW5pdChzdHJlYW0xKTtcbiAgICBjb25zdCBsaW5lUmVhZGVyMiA9IGF3YWl0IChuZXcgU3RyZWFtTGluZVJlYWRlcigpKS5pbml0KHN0cmVhbTIpO1xuICAgIGNvbnN0IHtjb21wYXJlRm4sIGNoYXJzZXR9ID0gdGhpcy5vcHRpb25zO1xuXG4gICAgbGluZVJlYWRlcjEuY2hhcnNldCA9IGNoYXJzZXQ7XG4gICAgbGluZVJlYWRlcjIuY2hhcnNldCA9IGNoYXJzZXQ7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnNraXBIZWFkZXIpIHtcbiAgICAgIGF3YWl0IGxpbmVSZWFkZXIxLm1vdmVOZXh0KCk7XG4gICAgICBhd2FpdCBsaW5lUmVhZGVyMi5tb3ZlTmV4dCgpO1xuICAgIH1cblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWF3YWl0LWluLWxvb3AgKi9cbiAgICAvLyB3aGlsZSBib3RoIGZpbGVzIGhhcyB2YWxpZCB2YWwsIGNoZWNrIGZvciBhY3R1YWwgZmFsc2UgdmFsdWVcbiAgICB3aGlsZSAobGluZVJlYWRlcjEuZW9mIDwgMiAmJiBsaW5lUmVhZGVyMi5lb2YgPCAyKSB7XG4gICAgICBhd2FpdCB0aGlzLmRvQ29tcGFyZUxpbmVSZWFkZXIobGluZVJlYWRlcjEsIGxpbmVSZWFkZXIyKTtcbiAgICB9XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1hd2FpdC1pbi1sb29wICovXG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFzeW5jIGRvQ29tcGFyZUxpbmVSZWFkZXIobGluZVJlYWRlcjE6IFN0cmVhbUxpbmVSZWFkZXIsIGxpbmVSZWFkZXIyOiBTdHJlYW1MaW5lUmVhZGVyKSB7XG4gICAgLy8gZm9yRWFjaCBsaW5lIGluIEZpbGUxLCBjb21wYXJlIHRvIGxpbmUgaW4gRmlsZTJcbiAgICBjb25zdCBsaW5lMSA9IGxpbmVSZWFkZXIxLnZhbHVlO1xuICAgIGNvbnN0IGxpbmUyID0gbGluZVJlYWRlcjIudmFsdWU7XG4gICAgY29uc3QgY21wID0gdGhpcy5vcHRpb25zLmNvbXBhcmVGbihsaW5lMSwgbGluZTIpO1xuXG4gICAgLy8gZGVidWcobGluZTEsIGxpbmUxLCBjbXApO1xuICAgIC8vIGRlYnVnKGxpbmVSZWFkZXIxLm5leHRWYWx1ZSwgbGluZVJlYWRlcjIubmV4dFZhbHVlLCAnbmV4dCcsIGxpbmVSZWFkZXIxLmVvZiwgbGluZVJlYWRlcjIuZW9mKTtcbiAgICAvLyBlbWl0IG9uIGNvbXBhcmVkXG4gICAgdGhpcy5lbWl0KCdjb21wYXJlZCcsIGxpbmUxLCBsaW5lMiwgY21wLCBsaW5lUmVhZGVyMSwgbGluZVJlYWRlcjIpO1xuXG4gICAgLy8gZXF1YWxzOiBpbmNyIGJvdGggZmlsZXMgdG8gbmV4dCBsaW5lXG4gICAgaWYgKGNtcCA9PT0gMCkge1xuICAgICAgYXdhaXQgbGluZVJlYWRlcjEubW92ZU5leHQoKTtcbiAgICAgIGF3YWl0IGxpbmVSZWFkZXIyLm1vdmVOZXh0KCk7XG4gICAgfSBlbHNlIGlmIChjbXAgPiAwKSB7XG4gICAgICAvLyBsaW5lMSA+IGxpbmUyOiBuZXcgbGluZSBkZXRlY3RlZFxuICAgICAgaWYgKGNtcCA9PT0gMSkge1xuICAgICAgICAvLyBpZiBmaWxlMiBlbmRlZCBiZWZvcmUgZmlsZTEsIHRoZW4gZmlsZTIgbG9zdCBsaW5lMVxuICAgICAgICAvLyBlbHNlIGZpbGUyIGhhcyBuZXcgbGluZVxuICAgICAgICBpZiAobGluZVJlYWRlcjIuZW9mID4gbGluZVJlYWRlcjEuZW9mKSB7XG4gICAgICAgICAgdGhpcy5lbWl0KCctJywgbGluZTEsIGxpbmVSZWFkZXIxLCBsaW5lUmVhZGVyMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5lbWl0KCcrJywgbGluZTIsIGxpbmVSZWFkZXIxLCBsaW5lUmVhZGVyMik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gaW5jciBGaWxlMiB0byBuZXh0IGxpbmVcbiAgICAgIGF3YWl0IGxpbmVSZWFkZXIyLm1vdmVOZXh0KCk7XG4gICAgfSBlbHNlIGlmIChjbXAgPCAwKSB7XG4gICAgICAvLyBsaW5lMSA8IGxpbmUyOiBkZWxldGVkIGxpbmVcbiAgICAgIGlmIChjbXAgPT09IC0xKSB7XG4gICAgICAgIC8vIGlmIGZpbGUxIGVuZGVkIGJlZm9yZSBmaWxlMiwgdGhlbiBmaWxlMiBoYXMgbmV3IGxpbmVcbiAgICAgICAgLy8gZWxzZSBmaWxlMSBsb3N0IGEgbGluZVxuICAgICAgICBpZiAobGluZVJlYWRlcjEuZW9mID4gbGluZVJlYWRlcjIuZW9mKSB7XG4gICAgICAgICAgdGhpcy5lbWl0KCcrJywgbGluZTIsIGxpbmVSZWFkZXIxLCBsaW5lUmVhZGVyMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5lbWl0KCctJywgbGluZTEsIGxpbmVSZWFkZXIxLCBsaW5lUmVhZGVyMik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gaW5jciBGaWxlMSB0byBuZXh0IGxpbmVcbiAgICAgIGF3YWl0IGxpbmVSZWFkZXIxLm1vdmVOZXh0KCk7XG4gICAgfVxuICB9XG59XG4iXX0=