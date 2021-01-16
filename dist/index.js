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
     * @param  NodeJS.ReadableStream stream1
     * @param  NodeJS.ReadableStream stream2
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW9DO0FBQ3BDLG1DQUEyQztBQUMzQywyQkFBOEM7QUFDOUMsdUNBQW9EO0FBRXBELGlDQUFrQztBQUVsQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUV4QyxNQUFhLGdCQUFnQjtJQUE3QjtRQUNFLFVBQUssR0FBVyxFQUFFLENBQUM7UUFDbkIsY0FBUyxHQUFXLEVBQUUsQ0FBQztRQUN2QixlQUFVLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDeEIsWUFBTyxHQUFRLE1BQU0sQ0FBQztRQUV0QixRQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUM7SUE2Qm5CLENBQUM7SUE1QkMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFpQztRQUMxQyxNQUFNLEVBQUUsR0FBRywwQkFBZSxDQUFDO1lBQ3pCLEtBQUssRUFBRSxVQUFVO1lBQ2pCLFNBQVMsRUFBRSxNQUFNLENBQUMsaUJBQWlCO1NBQ3BDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO1FBRXJDLHFCQUFxQjtRQUNyQixNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN0QixNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUV0QixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxLQUFLLENBQUMsUUFBUTtRQUNaLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUU1QixNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFeEMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFO1lBQ25CLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNYLFVB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QkFDYixxREFBcUQ7Z0JBQ3JELDBCQUEwQjtnQkFDMUIsSUFBSSxXQUFXLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUU7b0JBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7aUJBQ2pEO3FCQUFNO29CQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7aUJBQ2pEO2FBQ0Y7WUFFRCwwQkFBMEI7WUFDMUIsTUFBTSxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDOUI7YUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7WUFDbEIsOEJBQThCO1lBQzlCLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFO2dCQUNkLHVEQUF1RDtnQkFDdkQseUJBQXlCO2dCQUN6QixJQUFJLFdBQVcsQ0FBQyxHQUFHLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRTtvQkFDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztpQkFDakQ7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztpQkFDakQ7YUFDRjtZQUVELDBCQUEwQjtZQUMxQixNQUFNLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUM5QjtJQUNILENBQUM7Q0FDRjtBQS9GRCwrQkErRkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCB7VGV4dEZpbGVEaWZmT3B0aW9ufSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7UGF0aExpa2UsIGNyZWF0ZVJlYWRTdHJlYW19IGZyb20gJ2ZzJztcbmltcG9ydCB7SW50ZXJmYWNlLCBjcmVhdGVJbnRlcmZhY2V9IGZyb20gJ3JlYWRsaW5lJztcblxuaW1wb3J0IG15RGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpO1xuXG5jb25zdCBkZWJ1ZyA9IG15RGVidWcoJ3RleHQtZmlsZS1kaWZmJyk7XG5cbmV4cG9ydCBjbGFzcyBTdHJlYW1MaW5lUmVhZGVyIHtcbiAgdmFsdWU6IHN0cmluZyA9ICcnO1xuICBuZXh0VmFsdWU6IHN0cmluZyA9ICcnO1xuICBsaW5lTnVtYmVyOiBudW1iZXIgPSAtMTtcbiAgY2hhcnNldDogYW55ID0gJ3V0ZjgnO1xuICBpdD86IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxzdHJpbmc+O1xuICBlb2Y6IG51bWJlciA9IC0xO1xuICBhc3luYyBpbml0KHJlYWRTdHJlYW06IE5vZGVKUy5SZWFkYWJsZVN0cmVhbSk6IFByb21pc2U8U3RyZWFtTGluZVJlYWRlcj4ge1xuICAgIGNvbnN0IHJsID0gY3JlYXRlSW50ZXJmYWNlKHtcbiAgICAgIGlucHV0OiByZWFkU3RyZWFtLFxuICAgICAgY3JsZkRlbGF5OiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFlcbiAgICB9KTtcbiAgICB0aGlzLml0ID0gcmxbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG5cbiAgICAvLyBtb3ZlIHRvIGZpcnN0IGxpbmVcbiAgICBhd2FpdCB0aGlzLm1vdmVOZXh0KCk7XG4gICAgYXdhaXQgdGhpcy5tb3ZlTmV4dCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhc3luYyBtb3ZlTmV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHRoaXMudmFsdWUgPSB0aGlzLm5leHRWYWx1ZTtcblxuICAgIGNvbnN0IG5leHRSZXN1bHQgPSBhd2FpdCB0aGlzLml0Lm5leHQoKTtcblxuICAgIGlmIChuZXh0UmVzdWx0LmRvbmUpIHtcbiAgICAgIHRoaXMuZW9mKys7XG4gICAgICBuZXh0UmVzdWx0LnZhbHVlID0gJyc7XG4gICAgfVxuXG4gICAgdGhpcy5uZXh0VmFsdWUgPSBuZXh0UmVzdWx0LnZhbHVlO1xuICAgIHRoaXMubGluZU51bWJlcisrO1xuICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICB9XG59XG5cbi8qKlxuICogbGluZSBieSBsaW5lIGRpZmYgb2YgdHdvIGZpbGVzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRleHRGaWxlRGlmZiBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIG9wdGlvbnM6IFRleHRGaWxlRGlmZk9wdGlvbjtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zPzogVGV4dEZpbGVEaWZmT3B0aW9uKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBuZXcgVGV4dEZpbGVEaWZmT3B0aW9uKCk7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIHJ1biBkaWZmXG4gICAqIEBwYXJhbSAgU3RyaW5nIGZpbGUxIHBhdGggdG8gZmlsZSAxXG4gICAqIEBwYXJhbSAgU3RyaW5nIGZpbGUyIHBhdGggdG8gZmlsZSAyXG4gICAqIEByZXR1cm4gT2JqZWN0ICAgICAgICAgc2VsZlxuICAgKi9cbiAgYXN5bmMgZGlmZihmaWxlMTogc3RyaW5nLCBmaWxlMjogc3RyaW5nKSB7XG4gICAgY29uc3Qgc3RyZWFtMSA9IGNyZWF0ZVJlYWRTdHJlYW0oZmlsZTEpO1xuICAgIGNvbnN0IHN0cmVhbTIgPSBjcmVhdGVSZWFkU3RyZWFtKGZpbGUyKTtcbiAgICByZXR1cm4gdGhpcy5kaWZmU3RyZWFtKHN0cmVhbTEsIHN0cmVhbTIpO1xuICB9XG5cbiAgLyoqXG4gICAqIHJ1biBkaWZmU3RyZWFtXG4gICAqIEBwYXJhbSAgTm9kZUpTLlJlYWRhYmxlU3RyZWFtIHN0cmVhbTFcbiAgICogQHBhcmFtICBOb2RlSlMuUmVhZGFibGVTdHJlYW0gc3RyZWFtMlxuICAgKiBAcmV0dXJuIE9iamVjdCAgICAgICAgIHNlbGZcbiAgICovXG4gIGFzeW5jIGRpZmZTdHJlYW0oc3RyZWFtMTogTm9kZUpTLlJlYWRhYmxlU3RyZWFtLCBzdHJlYW0yOiBOb2RlSlMuUmVhZGFibGVTdHJlYW0pIHtcbiAgICBjb25zdCBsaW5lUmVhZGVyMSA9IGF3YWl0IChuZXcgU3RyZWFtTGluZVJlYWRlcigpKS5pbml0KHN0cmVhbTEpO1xuICAgIGNvbnN0IGxpbmVSZWFkZXIyID0gYXdhaXQgKG5ldyBTdHJlYW1MaW5lUmVhZGVyKCkpLmluaXQoc3RyZWFtMik7XG4gICAgY29uc3Qge2NvbXBhcmVGbiwgY2hhcnNldH0gPSB0aGlzLm9wdGlvbnM7XG5cbiAgICBsaW5lUmVhZGVyMS5jaGFyc2V0ID0gY2hhcnNldDtcbiAgICBsaW5lUmVhZGVyMi5jaGFyc2V0ID0gY2hhcnNldDtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuc2tpcEhlYWRlcikge1xuICAgICAgYXdhaXQgbGluZVJlYWRlcjEubW92ZU5leHQoKTtcbiAgICAgIGF3YWl0IGxpbmVSZWFkZXIyLm1vdmVOZXh0KCk7XG4gICAgfVxuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tYXdhaXQtaW4tbG9vcCAqL1xuICAgIC8vIHdoaWxlIGJvdGggZmlsZXMgaGFzIHZhbGlkIHZhbCwgY2hlY2sgZm9yIGFjdHVhbCBmYWxzZSB2YWx1ZVxuICAgIHdoaWxlIChsaW5lUmVhZGVyMS5lb2YgPCAyICYmIGxpbmVSZWFkZXIyLmVvZiA8IDIpIHtcbiAgICAgIGF3YWl0IHRoaXMuZG9Db21wYXJlTGluZVJlYWRlcihsaW5lUmVhZGVyMSwgbGluZVJlYWRlcjIpO1xuICAgIH1cbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWF3YWl0LWluLWxvb3AgKi9cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYXN5bmMgZG9Db21wYXJlTGluZVJlYWRlcihsaW5lUmVhZGVyMTogU3RyZWFtTGluZVJlYWRlciwgbGluZVJlYWRlcjI6IFN0cmVhbUxpbmVSZWFkZXIpIHtcbiAgICAvLyBmb3JFYWNoIGxpbmUgaW4gRmlsZTEsIGNvbXBhcmUgdG8gbGluZSBpbiBGaWxlMlxuICAgIGNvbnN0IGxpbmUxID0gbGluZVJlYWRlcjEudmFsdWU7XG4gICAgY29uc3QgbGluZTIgPSBsaW5lUmVhZGVyMi52YWx1ZTtcbiAgICBjb25zdCBjbXAgPSB0aGlzLm9wdGlvbnMuY29tcGFyZUZuKGxpbmUxLCBsaW5lMik7XG5cbiAgICAvLyBkZWJ1ZyhsaW5lMSwgbGluZTEsIGNtcCk7XG4gICAgLy8gZGVidWcobGluZVJlYWRlcjEubmV4dFZhbHVlLCBsaW5lUmVhZGVyMi5uZXh0VmFsdWUsICduZXh0JywgbGluZVJlYWRlcjEuZW9mLCBsaW5lUmVhZGVyMi5lb2YpO1xuICAgIC8vIGVtaXQgb24gY29tcGFyZWRcbiAgICB0aGlzLmVtaXQoJ2NvbXBhcmVkJywgbGluZTEsIGxpbmUyLCBjbXAsIGxpbmVSZWFkZXIxLCBsaW5lUmVhZGVyMik7XG5cbiAgICAvLyBlcXVhbHM6IGluY3IgYm90aCBmaWxlcyB0byBuZXh0IGxpbmVcbiAgICBpZiAoY21wID09PSAwKSB7XG4gICAgICBhd2FpdCBsaW5lUmVhZGVyMS5tb3ZlTmV4dCgpO1xuICAgICAgYXdhaXQgbGluZVJlYWRlcjIubW92ZU5leHQoKTtcbiAgICB9IGVsc2UgaWYgKGNtcCA+IDApIHtcbiAgICAgIC8vIGxpbmUxID4gbGluZTI6IG5ldyBsaW5lIGRldGVjdGVkXG4gICAgICBpZiAoY21wID09PSAxKSB7XG4gICAgICAgIC8vIGlmIGZpbGUyIGVuZGVkIGJlZm9yZSBmaWxlMSwgdGhlbiBmaWxlMiBsb3N0IGxpbmUxXG4gICAgICAgIC8vIGVsc2UgZmlsZTIgaGFzIG5ldyBsaW5lXG4gICAgICAgIGlmIChsaW5lUmVhZGVyMi5lb2YgPiBsaW5lUmVhZGVyMS5lb2YpIHtcbiAgICAgICAgICB0aGlzLmVtaXQoJy0nLCBsaW5lMSwgbGluZVJlYWRlcjEsIGxpbmVSZWFkZXIyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmVtaXQoJysnLCBsaW5lMiwgbGluZVJlYWRlcjEsIGxpbmVSZWFkZXIyKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBpbmNyIEZpbGUyIHRvIG5leHQgbGluZVxuICAgICAgYXdhaXQgbGluZVJlYWRlcjIubW92ZU5leHQoKTtcbiAgICB9IGVsc2UgaWYgKGNtcCA8IDApIHtcbiAgICAgIC8vIGxpbmUxIDwgbGluZTI6IGRlbGV0ZWQgbGluZVxuICAgICAgaWYgKGNtcCA9PT0gLTEpIHtcbiAgICAgICAgLy8gaWYgZmlsZTEgZW5kZWQgYmVmb3JlIGZpbGUyLCB0aGVuIGZpbGUyIGhhcyBuZXcgbGluZVxuICAgICAgICAvLyBlbHNlIGZpbGUxIGxvc3QgYSBsaW5lXG4gICAgICAgIGlmIChsaW5lUmVhZGVyMS5lb2YgPiBsaW5lUmVhZGVyMi5lb2YpIHtcbiAgICAgICAgICB0aGlzLmVtaXQoJysnLCBsaW5lMiwgbGluZVJlYWRlcjEsIGxpbmVSZWFkZXIyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmVtaXQoJy0nLCBsaW5lMSwgbGluZVJlYWRlcjEsIGxpbmVSZWFkZXIyKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBpbmNyIEZpbGUxIHRvIG5leHQgbGluZVxuICAgICAgYXdhaXQgbGluZVJlYWRlcjEubW92ZU5leHQoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==