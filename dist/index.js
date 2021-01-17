"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamLineReader = void 0;
const events_1 = require("events");
const types_1 = require("./types");
const fs_1 = require("fs");
const readline_1 = require("readline");
// import myDebug = require('debug');
// const debug = myDebug('text-file-diff');
class StreamLineReader {
    constructor() {
        this.value = '';
        this.nextValue = '';
        this.lineNumber = -1;
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
        if (this.options.skipHeader) {
            await lineReader1.moveNext();
            await lineReader2.moveNext();
        }
        /* eslint-disable no-await-in-loop */
        // while both files has valid val, check eof counter
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
        const cmpar = this.options.compareFn(line1, line2);
        // debug(line1, line1, cmpar);
        // debug(lineReader1.nextValue, lineReader2.nextValue, 'next', lineReader1.eof, lineReader2.eof);
        // emit on compared
        this.emit('compared', line1, line2, cmpar, lineReader1, lineReader2);
        if (cmpar > 0) {
            // line1 > line2: new line detected
            // if file2 ended before file1, then file2 lost line1
            // else file2 has new line
            if (lineReader2.eof > lineReader1.eof) {
                this.emit('-', line1, lineReader1, lineReader2);
            }
            else {
                this.emit('+', line2, lineReader1, lineReader2);
            }
            // incr File2 to next line
            await lineReader2.moveNext();
        }
        else if (cmpar < 0) {
            // line1 < line2: deleted line
            // if file1 ended before file2, then file2 has new line
            // else file1 lost a line
            if (lineReader1.eof > lineReader2.eof) {
                this.emit('+', line2, lineReader1, lineReader2);
            }
            else {
                this.emit('-', line1, lineReader1, lineReader2);
            }
            // incr File1 to next line
            await lineReader1.moveNext();
        }
        else {
            // equals: 0 incr both files to next line
            await lineReader1.moveNext();
            await lineReader2.moveNext();
        }
    }
}
exports.default = TextFileDiff;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW9DO0FBQ3BDLG1DQUEyQztBQUMzQywyQkFBOEM7QUFDOUMsdUNBQW9EO0FBR3BELHFDQUFxQztBQUNyQywyQ0FBMkM7QUFFM0MsTUFBYSxnQkFBZ0I7SUFBN0I7UUFDRSxVQUFLLEdBQVcsRUFBRSxDQUFDO1FBQ25CLGNBQVMsR0FBVyxFQUFFLENBQUM7UUFDdkIsZUFBVSxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBRXhCLFFBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQztJQTZCbkIsQ0FBQztJQTVCQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQTJCO1FBQ3BDLE1BQU0sRUFBRSxHQUFHLDBCQUFlLENBQUM7WUFDekIsS0FBSyxFQUFFLFVBQVU7WUFDakIsU0FBUyxFQUFFLE1BQU0sQ0FBQyxpQkFBaUI7U0FDcEMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7UUFFckMscUJBQXFCO1FBQ3JCLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3RCLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRXRCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELEtBQUssQ0FBQyxRQUFRO1FBQ1osSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBRTVCLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUV4QyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUU7WUFDbkIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ1gsVUFBVSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7U0FDdkI7UUFFRCxJQUFJLENBQUMsU0FBUyxHQUFHLFVB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O1lBQ3ZELHlCQUF5QjtZQUN6QixJQUFJLFdBQVcsQ0FBQyxHQUFHLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRTtnQkFDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQzthQUNqRDtpQkFBTTtnQkFDTCxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2FBQ2pEO1lBRUQsMEJBQTBCO1lBQzFCLE1BQU0sV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQzlCO2FBQU07WUFDTCx5Q0FBeUM7WUFDekMsTUFBTSxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDN0IsTUFBTSxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDOUI7SUFDSCxDQUFDO0NBQ0Y7QUF2RkQsK0JBdUZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQge1RleHRGaWxlRGlmZk9wdGlvbn0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQge1BhdGhMaWtlLCBjcmVhdGVSZWFkU3RyZWFtfSBmcm9tICdmcyc7XG5pbXBvcnQge0ludGVyZmFjZSwgY3JlYXRlSW50ZXJmYWNlfSBmcm9tICdyZWFkbGluZSc7XG5pbXBvcnQgc3RyZWFtIGZyb20gJ3N0cmVhbSc7XG5cbi8vIGltcG9ydCBteURlYnVnID0gcmVxdWlyZSgnZGVidWcnKTtcbi8vIGNvbnN0IGRlYnVnID0gbXlEZWJ1ZygndGV4dC1maWxlLWRpZmYnKTtcblxuZXhwb3J0IGNsYXNzIFN0cmVhbUxpbmVSZWFkZXIge1xuICB2YWx1ZTogc3RyaW5nID0gJyc7XG4gIG5leHRWYWx1ZTogc3RyaW5nID0gJyc7XG4gIGxpbmVOdW1iZXI6IG51bWJlciA9IC0xO1xuICBpdD86IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxzdHJpbmc+O1xuICBlb2Y6IG51bWJlciA9IC0xO1xuICBhc3luYyBpbml0KHJlYWRTdHJlYW06IHN0cmVhbS5SZWFkYWJsZSk6IFByb21pc2U8U3RyZWFtTGluZVJlYWRlcj4ge1xuICAgIGNvbnN0IHJsID0gY3JlYXRlSW50ZXJmYWNlKHtcbiAgICAgIGlucHV0OiByZWFkU3RyZWFtLFxuICAgICAgY3JsZkRlbGF5OiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFlcbiAgICB9KTtcbiAgICB0aGlzLml0ID0gcmxbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG5cbiAgICAvLyBtb3ZlIHRvIGZpcnN0IGxpbmVcbiAgICBhd2FpdCB0aGlzLm1vdmVOZXh0KCk7XG4gICAgYXdhaXQgdGhpcy5tb3ZlTmV4dCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhc3luYyBtb3ZlTmV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHRoaXMudmFsdWUgPSB0aGlzLm5leHRWYWx1ZTtcblxuICAgIGNvbnN0IG5leHRSZXN1bHQgPSBhd2FpdCB0aGlzLml0Lm5leHQoKTtcblxuICAgIGlmIChuZXh0UmVzdWx0LmRvbmUpIHtcbiAgICAgIHRoaXMuZW9mKys7XG4gICAgICBuZXh0UmVzdWx0LnZhbHVlID0gJyc7XG4gICAgfVxuXG4gICAgdGhpcy5uZXh0VmFsdWUgPSBuZXh0UmVzdWx0LnZhbHVlO1xuICAgIHRoaXMubGluZU51bWJlcisrO1xuICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICB9XG59XG5cbi8qKlxuICogbGluZSBieSBsaW5lIGRpZmYgb2YgdHdvIGZpbGVzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRleHRGaWxlRGlmZiBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIG9wdGlvbnM6IFRleHRGaWxlRGlmZk9wdGlvbjtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zPzogVGV4dEZpbGVEaWZmT3B0aW9uKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBuZXcgVGV4dEZpbGVEaWZmT3B0aW9uKCk7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIHJ1biBkaWZmXG4gICAqIEBwYXJhbSAgU3RyaW5nIGZpbGUxIHBhdGggdG8gZmlsZSAxXG4gICAqIEBwYXJhbSAgU3RyaW5nIGZpbGUyIHBhdGggdG8gZmlsZSAyXG4gICAqIEByZXR1cm4gT2JqZWN0ICAgICAgICAgc2VsZlxuICAgKi9cbiAgYXN5bmMgZGlmZihmaWxlMTogc3RyaW5nLCBmaWxlMjogc3RyaW5nKSB7XG4gICAgY29uc3Qgc3RyZWFtMSA9IGNyZWF0ZVJlYWRTdHJlYW0oZmlsZTEpO1xuICAgIGNvbnN0IHN0cmVhbTIgPSBjcmVhdGVSZWFkU3RyZWFtKGZpbGUyKTtcbiAgICByZXR1cm4gdGhpcy5kaWZmU3RyZWFtKHN0cmVhbTEsIHN0cmVhbTIpO1xuICB9XG5cbiAgLyoqXG4gICAqIHJ1biBkaWZmU3RyZWFtXG4gICAqIEBwYXJhbSAgUmVhZGFibGUgc3RyZWFtMVxuICAgKiBAcGFyYW0gIFJlYWRhYmxlIHN0cmVhbTJcbiAgICogQHJldHVybiBPYmplY3QgICAgICAgICBzZWxmXG4gICAqL1xuICBhc3luYyBkaWZmU3RyZWFtKHN0cmVhbTE6IHN0cmVhbS5SZWFkYWJsZSwgc3RyZWFtMjogc3RyZWFtLlJlYWRhYmxlKSB7XG4gICAgY29uc3QgbGluZVJlYWRlcjEgPSBhd2FpdCAobmV3IFN0cmVhbUxpbmVSZWFkZXIoKSkuaW5pdChzdHJlYW0xKTtcbiAgICBjb25zdCBsaW5lUmVhZGVyMiA9IGF3YWl0IChuZXcgU3RyZWFtTGluZVJlYWRlcigpKS5pbml0KHN0cmVhbTIpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5za2lwSGVhZGVyKSB7XG4gICAgICBhd2FpdCBsaW5lUmVhZGVyMS5tb3ZlTmV4dCgpO1xuICAgICAgYXdhaXQgbGluZVJlYWRlcjIubW92ZU5leHQoKTtcbiAgICB9XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1hd2FpdC1pbi1sb29wICovXG4gICAgLy8gd2hpbGUgYm90aCBmaWxlcyBoYXMgdmFsaWQgdmFsLCBjaGVjayBlb2YgY291bnRlclxuICAgIHdoaWxlIChsaW5lUmVhZGVyMS5lb2YgPCAyICYmIGxpbmVSZWFkZXIyLmVvZiA8IDIpIHtcbiAgICAgIGF3YWl0IHRoaXMuZG9Db21wYXJlTGluZVJlYWRlcihsaW5lUmVhZGVyMSwgbGluZVJlYWRlcjIpO1xuICAgIH1cbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWF3YWl0LWluLWxvb3AgKi9cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYXN5bmMgZG9Db21wYXJlTGluZVJlYWRlcihsaW5lUmVhZGVyMTogU3RyZWFtTGluZVJlYWRlciwgbGluZVJlYWRlcjI6IFN0cmVhbUxpbmVSZWFkZXIpIHtcbiAgICAvLyBmb3JFYWNoIGxpbmUgaW4gRmlsZTEsIGNvbXBhcmUgdG8gbGluZSBpbiBGaWxlMlxuICAgIGNvbnN0IGxpbmUxID0gbGluZVJlYWRlcjEudmFsdWU7XG4gICAgY29uc3QgbGluZTIgPSBsaW5lUmVhZGVyMi52YWx1ZTtcbiAgICBjb25zdCBjbXBhciA9IHRoaXMub3B0aW9ucy5jb21wYXJlRm4obGluZTEsIGxpbmUyKTtcblxuICAgIC8vIGRlYnVnKGxpbmUxLCBsaW5lMSwgY21wYXIpO1xuICAgIC8vIGRlYnVnKGxpbmVSZWFkZXIxLm5leHRWYWx1ZSwgbGluZVJlYWRlcjIubmV4dFZhbHVlLCAnbmV4dCcsIGxpbmVSZWFkZXIxLmVvZiwgbGluZVJlYWRlcjIuZW9mKTtcbiAgICAvLyBlbWl0IG9uIGNvbXBhcmVkXG4gICAgdGhpcy5lbWl0KCdjb21wYXJlZCcsIGxpbmUxLCBsaW5lMiwgY21wYXIsIGxpbmVSZWFkZXIxLCBsaW5lUmVhZGVyMik7XG5cbiAgICBpZiAoY21wYXIgPiAwKSB7XG4gICAgICAvLyBsaW5lMSA+IGxpbmUyOiBuZXcgbGluZSBkZXRlY3RlZFxuICAgICAgLy8gaWYgZmlsZTIgZW5kZWQgYmVmb3JlIGZpbGUxLCB0aGVuIGZpbGUyIGxvc3QgbGluZTFcbiAgICAgIC8vIGVsc2UgZmlsZTIgaGFzIG5ldyBsaW5lXG4gICAgICBpZiAobGluZVJlYWRlcjIuZW9mID4gbGluZVJlYWRlcjEuZW9mKSB7XG4gICAgICAgIHRoaXMuZW1pdCgnLScsIGxpbmUxLCBsaW5lUmVhZGVyMSwgbGluZVJlYWRlcjIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lbWl0KCcrJywgbGluZTIsIGxpbmVSZWFkZXIxLCBsaW5lUmVhZGVyMik7XG4gICAgICB9XG5cbiAgICAgIC8vIGluY3IgRmlsZTIgdG8gbmV4dCBsaW5lXG4gICAgICBhd2FpdCBsaW5lUmVhZGVyMi5tb3ZlTmV4dCgpO1xuICAgIH0gZWxzZSBpZiAoY21wYXIgPCAwKSB7XG4gICAgICAvLyBsaW5lMSA8IGxpbmUyOiBkZWxldGVkIGxpbmVcbiAgICAgIC8vIGlmIGZpbGUxIGVuZGVkIGJlZm9yZSBmaWxlMiwgdGhlbiBmaWxlMiBoYXMgbmV3IGxpbmVcbiAgICAgIC8vIGVsc2UgZmlsZTEgbG9zdCBhIGxpbmVcbiAgICAgIGlmIChsaW5lUmVhZGVyMS5lb2YgPiBsaW5lUmVhZGVyMi5lb2YpIHtcbiAgICAgICAgdGhpcy5lbWl0KCcrJywgbGluZTIsIGxpbmVSZWFkZXIxLCBsaW5lUmVhZGVyMik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVtaXQoJy0nLCBsaW5lMSwgbGluZVJlYWRlcjEsIGxpbmVSZWFkZXIyKTtcbiAgICAgIH1cblxuICAgICAgLy8gaW5jciBGaWxlMSB0byBuZXh0IGxpbmVcbiAgICAgIGF3YWl0IGxpbmVSZWFkZXIxLm1vdmVOZXh0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGVxdWFsczogMCBpbmNyIGJvdGggZmlsZXMgdG8gbmV4dCBsaW5lXG4gICAgICBhd2FpdCBsaW5lUmVhZGVyMS5tb3ZlTmV4dCgpO1xuICAgICAgYXdhaXQgbGluZVJlYWRlcjIubW92ZU5leHQoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==