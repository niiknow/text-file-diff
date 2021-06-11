"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamLineReader = void 0;
const eventemitter2_1 = require("eventemitter2");
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
class TextFileDiff extends eventemitter2_1.EventEmitter2 {
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
        await this.emitAsync('compared', line1, line2, cmpar, lineReader1, lineReader2);
        if (cmpar > 0) {
            // line1 > line2: new line detected
            // if file2 ended before file1, then file2 lost line1
            // else file2 has new line
            /* eslint-disable @typescript-eslint/no-unused-expressions */
            lineReader2.eof > lineReader1.eof ?
                await this.emitAsync('-', line1, lineReader1, lineReader2) :
                await this.emitAsync('+', line2, lineReader1, lineReader2);
            /* eslint-enable @typescript-eslint/no-unused-expressions */
            // incr File2 to next line
            await lineReader2.moveNext();
        }
        else if (cmpar < 0) {
            // line1 < line2: deleted line
            // if file1 ended before file2, then file2 has new line
            // else file1 lost a line
            /* eslint-disable @typescript-eslint/no-unused-expressions */
            lineReader1.eof > lineReader2.eof ?
                await this.emitAsync('+', line2, lineReader1, lineReader2) :
                await this.emitAsync('-', line1, lineReader1, lineReader2);
            /* eslint-enable @typescript-eslint/no-unused-expressions */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaURBQTRDO0FBQzVDLG1DQUEyQztBQUMzQywyQkFBb0M7QUFDcEMsdUNBQXlDO0FBR3pDLHFDQUFxQztBQUNyQywyQ0FBMkM7QUFFM0MsTUFBYSxnQkFBZ0I7SUFBN0I7UUFDRSxVQUFLLEdBQVcsRUFBRSxDQUFDO1FBQ25CLGNBQVMsR0FBVyxFQUFFLENBQUM7UUFDdkIsZUFBVSxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBRXhCLFFBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQztJQTZCbkIsQ0FBQztJQTVCQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQTJCO1FBQ3BDLE1BQU0sRUFBRSxHQUFHLDBCQUFlLENBQUM7WUFDekIsS0FBSyxFQUFFLFVBQVU7WUFDakIsU0FBUyxFQUFFLE1BQU0sQ0FBQyxpQkFBaUI7U0FDcEMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7UUFFckMscUJBQXFCO1FBQ3JCLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3RCLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRXRCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELEtBQUssQ0FBQyxRQUFRO1FBQ1osSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBRTVCLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUV4QyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUU7WUFDbkIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ1gsVUFBVSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7U0FDdkI7UUFFRCxJQUFJLENBQUMsU0FBUyxHQUFHLFVB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RUFBRTtZQUNwQiw4QkFBOEI7WUFDOUIsdURBQXVEO1lBQ3ZELHlCQUF5QjtZQUV6Qiw2REFBNkQ7WUFDN0QsV0FBVyxDQUFDLEdBQUcsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2pDLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUM1RCxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDN0QsNERBQTREO1lBRTVELDBCQUEwQjtZQUMxQixNQUFNLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUM5QjthQUFNO1lBQ0wseUNBQXlDO1lBQ3pDLE1BQU0sV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzdCLE1BQU0sV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQzlCO0lBQ0gsQ0FBQztDQUNGO0FBekZELCtCQXlGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RXZlbnRFbWl0dGVyMn0gZnJvbSAnZXZlbnRlbWl0dGVyMic7XG5pbXBvcnQge1RleHRGaWxlRGlmZk9wdGlvbn0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQge2NyZWF0ZVJlYWRTdHJlYW19IGZyb20gJ2ZzJztcbmltcG9ydCB7Y3JlYXRlSW50ZXJmYWNlfSBmcm9tICdyZWFkbGluZSc7XG5pbXBvcnQgc3RyZWFtIGZyb20gJ3N0cmVhbSc7XG5cbi8vIGltcG9ydCBteURlYnVnID0gcmVxdWlyZSgnZGVidWcnKTtcbi8vIGNvbnN0IGRlYnVnID0gbXlEZWJ1ZygndGV4dC1maWxlLWRpZmYnKTtcblxuZXhwb3J0IGNsYXNzIFN0cmVhbUxpbmVSZWFkZXIge1xuICB2YWx1ZTogc3RyaW5nID0gJyc7XG4gIG5leHRWYWx1ZTogc3RyaW5nID0gJyc7XG4gIGxpbmVOdW1iZXI6IG51bWJlciA9IC0xO1xuICBpdD86IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxzdHJpbmc+O1xuICBlb2Y6IG51bWJlciA9IC0xO1xuICBhc3luYyBpbml0KHJlYWRTdHJlYW06IHN0cmVhbS5SZWFkYWJsZSk6IFByb21pc2U8U3RyZWFtTGluZVJlYWRlcj4ge1xuICAgIGNvbnN0IHJsID0gY3JlYXRlSW50ZXJmYWNlKHtcbiAgICAgIGlucHV0OiByZWFkU3RyZWFtLFxuICAgICAgY3JsZkRlbGF5OiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFlcbiAgICB9KTtcbiAgICB0aGlzLml0ID0gcmxbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG5cbiAgICAvLyBtb3ZlIHRvIGZpcnN0IGxpbmVcbiAgICBhd2FpdCB0aGlzLm1vdmVOZXh0KCk7XG4gICAgYXdhaXQgdGhpcy5tb3ZlTmV4dCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhc3luYyBtb3ZlTmV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHRoaXMudmFsdWUgPSB0aGlzLm5leHRWYWx1ZTtcblxuICAgIGNvbnN0IG5leHRSZXN1bHQgPSBhd2FpdCB0aGlzLml0Lm5leHQoKTtcblxuICAgIGlmIChuZXh0UmVzdWx0LmRvbmUpIHtcbiAgICAgIHRoaXMuZW9mKys7XG4gICAgICBuZXh0UmVzdWx0LnZhbHVlID0gJyc7XG4gICAgfVxuXG4gICAgdGhpcy5uZXh0VmFsdWUgPSBuZXh0UmVzdWx0LnZhbHVlO1xuICAgIHRoaXMubGluZU51bWJlcisrO1xuICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICB9XG59XG5cbi8qKlxuICogbGluZSBieSBsaW5lIGRpZmYgb2YgdHdvIGZpbGVzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRleHRGaWxlRGlmZiBleHRlbmRzIEV2ZW50RW1pdHRlcjIge1xuICBvcHRpb25zOiBUZXh0RmlsZURpZmZPcHRpb247XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucz86IFRleHRGaWxlRGlmZk9wdGlvbikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5vcHRpb25zID0gbmV3IFRleHRGaWxlRGlmZk9wdGlvbigpO1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5vcHRpb25zLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBydW4gZGlmZlxuICAgKiBAcGFyYW0gIFN0cmluZyBmaWxlMSBwYXRoIHRvIGZpbGUgMVxuICAgKiBAcGFyYW0gIFN0cmluZyBmaWxlMiBwYXRoIHRvIGZpbGUgMlxuICAgKiBAcmV0dXJuIE9iamVjdCAgICAgICAgIHNlbGZcbiAgICovXG4gIGFzeW5jIGRpZmYoZmlsZTE6IHN0cmluZywgZmlsZTI6IHN0cmluZykge1xuICAgIGNvbnN0IHN0cmVhbTEgPSBjcmVhdGVSZWFkU3RyZWFtKGZpbGUxKTtcbiAgICBjb25zdCBzdHJlYW0yID0gY3JlYXRlUmVhZFN0cmVhbShmaWxlMik7XG4gICAgcmV0dXJuIHRoaXMuZGlmZlN0cmVhbShzdHJlYW0xLCBzdHJlYW0yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBydW4gZGlmZlN0cmVhbVxuICAgKiBAcGFyYW0gIFJlYWRhYmxlIHN0cmVhbTFcbiAgICogQHBhcmFtICBSZWFkYWJsZSBzdHJlYW0yXG4gICAqIEByZXR1cm4gT2JqZWN0ICAgICAgICAgc2VsZlxuICAgKi9cbiAgYXN5bmMgZGlmZlN0cmVhbShzdHJlYW0xOiBzdHJlYW0uUmVhZGFibGUsIHN0cmVhbTI6IHN0cmVhbS5SZWFkYWJsZSkge1xuICAgIGNvbnN0IGxpbmVSZWFkZXIxID0gYXdhaXQgKG5ldyBTdHJlYW1MaW5lUmVhZGVyKCkpLmluaXQoc3RyZWFtMSk7XG4gICAgY29uc3QgbGluZVJlYWRlcjIgPSBhd2FpdCAobmV3IFN0cmVhbUxpbmVSZWFkZXIoKSkuaW5pdChzdHJlYW0yKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuc2tpcEhlYWRlcikge1xuICAgICAgYXdhaXQgbGluZVJlYWRlcjEubW92ZU5leHQoKTtcbiAgICAgIGF3YWl0IGxpbmVSZWFkZXIyLm1vdmVOZXh0KCk7XG4gICAgfVxuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tYXdhaXQtaW4tbG9vcCAqL1xuICAgIC8vIHdoaWxlIGJvdGggZmlsZXMgaGFzIHZhbGlkIHZhbCwgY2hlY2sgZW9mIGNvdW50ZXJcbiAgICB3aGlsZSAobGluZVJlYWRlcjEuZW9mIDwgMiAmJiBsaW5lUmVhZGVyMi5lb2YgPCAyKSB7XG4gICAgICBhd2FpdCB0aGlzLmRvQ29tcGFyZUxpbmVSZWFkZXIobGluZVJlYWRlcjEsIGxpbmVSZWFkZXIyKTtcbiAgICB9XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1hd2FpdC1pbi1sb29wICovXG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFzeW5jIGRvQ29tcGFyZUxpbmVSZWFkZXIobGluZVJlYWRlcjE6IFN0cmVhbUxpbmVSZWFkZXIsIGxpbmVSZWFkZXIyOiBTdHJlYW1MaW5lUmVhZGVyKSB7XG4gICAgLy8gZm9yRWFjaCBsaW5lIGluIEZpbGUxLCBjb21wYXJlIHRvIGxpbmUgaW4gRmlsZTJcbiAgICBjb25zdCBsaW5lMSA9IGxpbmVSZWFkZXIxLnZhbHVlO1xuICAgIGNvbnN0IGxpbmUyID0gbGluZVJlYWRlcjIudmFsdWU7XG4gICAgY29uc3QgY21wYXIgPSB0aGlzLm9wdGlvbnMuY29tcGFyZUZuKGxpbmUxLCBsaW5lMik7XG5cbiAgICAvLyBkZWJ1ZyhsaW5lMSwgbGluZTEsIGNtcGFyKTtcbiAgICAvLyBkZWJ1ZyhsaW5lUmVhZGVyMS5uZXh0VmFsdWUsIGxpbmVSZWFkZXIyLm5leHRWYWx1ZSwgJ25leHQnLCBsaW5lUmVhZGVyMS5lb2YsIGxpbmVSZWFkZXIyLmVvZik7XG4gICAgLy8gZW1pdCBvbiBjb21wYXJlZFxuICAgIGF3YWl0IHRoaXMuZW1pdEFzeW5jKCdjb21wYXJlZCcsIGxpbmUxLCBsaW5lMiwgY21wYXIsIGxpbmVSZWFkZXIxLCBsaW5lUmVhZGVyMik7XG5cbiAgICBpZiAoY21wYXIgPiAwKSB7XG4gICAgICAvLyBsaW5lMSA+IGxpbmUyOiBuZXcgbGluZSBkZXRlY3RlZFxuICAgICAgLy8gaWYgZmlsZTIgZW5kZWQgYmVmb3JlIGZpbGUxLCB0aGVuIGZpbGUyIGxvc3QgbGluZTFcbiAgICAgIC8vIGVsc2UgZmlsZTIgaGFzIG5ldyBsaW5lXG5cbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtZXhwcmVzc2lvbnMgKi9cbiAgICAgIGxpbmVSZWFkZXIyLmVvZiA+IGxpbmVSZWFkZXIxLmVvZiA/XG4gICAgICAgIGF3YWl0IHRoaXMuZW1pdEFzeW5jKCctJywgbGluZTEsIGxpbmVSZWFkZXIxLCBsaW5lUmVhZGVyMikgOlxuICAgICAgICBhd2FpdCB0aGlzLmVtaXRBc3luYygnKycsIGxpbmUyLCBsaW5lUmVhZGVyMSwgbGluZVJlYWRlcjIpO1xuICAgICAgLyogZXNsaW50LWVuYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLWV4cHJlc3Npb25zICovXG5cbiAgICAgIC8vIGluY3IgRmlsZTIgdG8gbmV4dCBsaW5lXG4gICAgICBhd2FpdCBsaW5lUmVhZGVyMi5tb3ZlTmV4dCgpO1xuICAgIH0gZWxzZSBpZiAoY21wYXIgPCAwKSB7XG4gICAgICAvLyBsaW5lMSA8IGxpbmUyOiBkZWxldGVkIGxpbmVcbiAgICAgIC8vIGlmIGZpbGUxIGVuZGVkIGJlZm9yZSBmaWxlMiwgdGhlbiBmaWxlMiBoYXMgbmV3IGxpbmVcbiAgICAgIC8vIGVsc2UgZmlsZTEgbG9zdCBhIGxpbmVcblxuICAgICAgLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC1leHByZXNzaW9ucyAqL1xuICAgICAgbGluZVJlYWRlcjEuZW9mID4gbGluZVJlYWRlcjIuZW9mID9cbiAgICAgICAgYXdhaXQgdGhpcy5lbWl0QXN5bmMoJysnLCBsaW5lMiwgbGluZVJlYWRlcjEsIGxpbmVSZWFkZXIyKSA6XG4gICAgICAgIGF3YWl0IHRoaXMuZW1pdEFzeW5jKCctJywgbGluZTEsIGxpbmVSZWFkZXIxLCBsaW5lUmVhZGVyMik7XG4gICAgICAvKiBlc2xpbnQtZW5hYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtZXhwcmVzc2lvbnMgKi9cblxuICAgICAgLy8gaW5jciBGaWxlMSB0byBuZXh0IGxpbmVcbiAgICAgIGF3YWl0IGxpbmVSZWFkZXIxLm1vdmVOZXh0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGVxdWFsczogMCBpbmNyIGJvdGggZmlsZXMgdG8gbmV4dCBsaW5lXG4gICAgICBhd2FpdCBsaW5lUmVhZGVyMS5tb3ZlTmV4dCgpO1xuICAgICAgYXdhaXQgbGluZVJlYWRlcjIubW92ZU5leHQoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==