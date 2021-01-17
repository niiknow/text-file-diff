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
        const { compareFn } = this.options;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW9DO0FBQ3BDLG1DQUEyQztBQUMzQywyQkFBOEM7QUFDOUMsdUNBQW9EO0FBR3BELGlDQUFrQztBQUVsQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUV4QyxNQUFhLGdCQUFnQjtJQUE3QjtRQUNFLFVBQUssR0FBVyxFQUFFLENBQUM7UUFDbkIsY0FBUyxHQUFXLEVBQUUsQ0FBQztRQUN2QixlQUFVLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFeEIsUUFBRyxHQUFXLENBQUMsQ0FBQyxDQUFDO0lBNkJuQixDQUFDO0lBNUJDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBMkI7UUFDcEMsTUFBTSxFQUFFLEdBQUcsMEJBQWUsQ0FBQztZQUN6QixLQUFLLEVBQUUsVUFBVTtZQUNqQixTQUFTLEVBQUUsTUFBTSxDQUFDLGlCQUFpQjtTQUNwQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztRQUVyQyxxQkFBcUI7UUFDckIsTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdEIsTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFdEIsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsS0FBSyxDQUFDLFFBQVE7UUFDWixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFFNUIsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXhDLElBQUksVUFBVSxDQUFDLElBQUksRUFBRTtZQUNuQixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDWCxVQUFVLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FB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RyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7aUJBQ2pEO3FCQUFNO29CQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7aUJBQ2pEO2FBQ0Y7WUFFRCwwQkFBMEI7WUFDMUIsTUFBTSxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDOUI7YUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7WUFDbEIsOEJBQThCO1lBQzlCLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFO2dCQUNkLHVEQUF1RDtnQkFDdkQseUJBQXlCO2dCQUN6QixJQUFJLFdBQVcsQ0FBQyxHQUFHLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRTtvQkFDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztpQkFDakQ7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztpQkFDakQ7YUFDRjtZQUVELDBCQUEwQjtZQUMxQixNQUFNLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUM5QjtJQUNILENBQUM7Q0FDRjtBQTVGRCwrQkE0RkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCB7VGV4dEZpbGVEaWZmT3B0aW9ufSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7UGF0aExpa2UsIGNyZWF0ZVJlYWRTdHJlYW19IGZyb20gJ2ZzJztcbmltcG9ydCB7SW50ZXJmYWNlLCBjcmVhdGVJbnRlcmZhY2V9IGZyb20gJ3JlYWRsaW5lJztcbmltcG9ydCBzdHJlYW0gZnJvbSAnc3RyZWFtJztcblxuaW1wb3J0IG15RGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpO1xuXG5jb25zdCBkZWJ1ZyA9IG15RGVidWcoJ3RleHQtZmlsZS1kaWZmJyk7XG5cbmV4cG9ydCBjbGFzcyBTdHJlYW1MaW5lUmVhZGVyIHtcbiAgdmFsdWU6IHN0cmluZyA9ICcnO1xuICBuZXh0VmFsdWU6IHN0cmluZyA9ICcnO1xuICBsaW5lTnVtYmVyOiBudW1iZXIgPSAtMTtcbiAgaXQ/OiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8c3RyaW5nPjtcbiAgZW9mOiBudW1iZXIgPSAtMTtcbiAgYXN5bmMgaW5pdChyZWFkU3RyZWFtOiBzdHJlYW0uUmVhZGFibGUpOiBQcm9taXNlPFN0cmVhbUxpbmVSZWFkZXI+IHtcbiAgICBjb25zdCBybCA9IGNyZWF0ZUludGVyZmFjZSh7XG4gICAgICBpbnB1dDogcmVhZFN0cmVhbSxcbiAgICAgIGNybGZEZWxheTogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZXG4gICAgfSk7XG4gICAgdGhpcy5pdCA9IHJsW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuXG4gICAgLy8gbW92ZSB0byBmaXJzdCBsaW5lXG4gICAgYXdhaXQgdGhpcy5tb3ZlTmV4dCgpO1xuICAgIGF3YWl0IHRoaXMubW92ZU5leHQoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYXN5bmMgbW92ZU5leHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICB0aGlzLnZhbHVlID0gdGhpcy5uZXh0VmFsdWU7XG5cbiAgICBjb25zdCBuZXh0UmVzdWx0ID0gYXdhaXQgdGhpcy5pdC5uZXh0KCk7XG5cbiAgICBpZiAobmV4dFJlc3VsdC5kb25lKSB7XG4gICAgICB0aGlzLmVvZisrO1xuICAgICAgbmV4dFJlc3VsdC52YWx1ZSA9ICcnO1xuICAgIH1cblxuICAgIHRoaXMubmV4dFZhbHVlID0gbmV4dFJlc3VsdC52YWx1ZTtcbiAgICB0aGlzLmxpbmVOdW1iZXIrKztcbiAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgfVxufVxuXG4vKipcbiAqIGxpbmUgYnkgbGluZSBkaWZmIG9mIHR3byBmaWxlc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXh0RmlsZURpZmYgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBvcHRpb25zOiBUZXh0RmlsZURpZmZPcHRpb247XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucz86IFRleHRGaWxlRGlmZk9wdGlvbikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5vcHRpb25zID0gbmV3IFRleHRGaWxlRGlmZk9wdGlvbigpO1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5vcHRpb25zLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBydW4gZGlmZlxuICAgKiBAcGFyYW0gIFN0cmluZyBmaWxlMSBwYXRoIHRvIGZpbGUgMVxuICAgKiBAcGFyYW0gIFN0cmluZyBmaWxlMiBwYXRoIHRvIGZpbGUgMlxuICAgKiBAcmV0dXJuIE9iamVjdCAgICAgICAgIHNlbGZcbiAgICovXG4gIGFzeW5jIGRpZmYoZmlsZTE6IHN0cmluZywgZmlsZTI6IHN0cmluZykge1xuICAgIGNvbnN0IHN0cmVhbTEgPSBjcmVhdGVSZWFkU3RyZWFtKGZpbGUxKTtcbiAgICBjb25zdCBzdHJlYW0yID0gY3JlYXRlUmVhZFN0cmVhbShmaWxlMik7XG4gICAgcmV0dXJuIHRoaXMuZGlmZlN0cmVhbShzdHJlYW0xLCBzdHJlYW0yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBydW4gZGlmZlN0cmVhbVxuICAgKiBAcGFyYW0gIFJlYWRhYmxlIHN0cmVhbTFcbiAgICogQHBhcmFtICBSZWFkYWJsZSBzdHJlYW0yXG4gICAqIEByZXR1cm4gT2JqZWN0ICAgICAgICAgc2VsZlxuICAgKi9cbiAgYXN5bmMgZGlmZlN0cmVhbShzdHJlYW0xOiBzdHJlYW0uUmVhZGFibGUsIHN0cmVhbTI6IHN0cmVhbS5SZWFkYWJsZSkge1xuICAgIGNvbnN0IGxpbmVSZWFkZXIxID0gYXdhaXQgKG5ldyBTdHJlYW1MaW5lUmVhZGVyKCkpLmluaXQoc3RyZWFtMSk7XG4gICAgY29uc3QgbGluZVJlYWRlcjIgPSBhd2FpdCAobmV3IFN0cmVhbUxpbmVSZWFkZXIoKSkuaW5pdChzdHJlYW0yKTtcbiAgICBjb25zdCB7Y29tcGFyZUZufSA9IHRoaXMub3B0aW9ucztcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuc2tpcEhlYWRlcikge1xuICAgICAgYXdhaXQgbGluZVJlYWRlcjEubW92ZU5leHQoKTtcbiAgICAgIGF3YWl0IGxpbmVSZWFkZXIyLm1vdmVOZXh0KCk7XG4gICAgfVxuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tYXdhaXQtaW4tbG9vcCAqL1xuICAgIC8vIHdoaWxlIGJvdGggZmlsZXMgaGFzIHZhbGlkIHZhbCwgY2hlY2sgZm9yIGFjdHVhbCBmYWxzZSB2YWx1ZVxuICAgIHdoaWxlIChsaW5lUmVhZGVyMS5lb2YgPCAyICYmIGxpbmVSZWFkZXIyLmVvZiA8IDIpIHtcbiAgICAgIGF3YWl0IHRoaXMuZG9Db21wYXJlTGluZVJlYWRlcihsaW5lUmVhZGVyMSwgbGluZVJlYWRlcjIpO1xuICAgIH1cbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWF3YWl0LWluLWxvb3AgKi9cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYXN5bmMgZG9Db21wYXJlTGluZVJlYWRlcihsaW5lUmVhZGVyMTogU3RyZWFtTGluZVJlYWRlciwgbGluZVJlYWRlcjI6IFN0cmVhbUxpbmVSZWFkZXIpIHtcbiAgICAvLyBmb3JFYWNoIGxpbmUgaW4gRmlsZTEsIGNvbXBhcmUgdG8gbGluZSBpbiBGaWxlMlxuICAgIGNvbnN0IGxpbmUxID0gbGluZVJlYWRlcjEudmFsdWU7XG4gICAgY29uc3QgbGluZTIgPSBsaW5lUmVhZGVyMi52YWx1ZTtcbiAgICBjb25zdCBjbXAgPSB0aGlzLm9wdGlvbnMuY29tcGFyZUZuKGxpbmUxLCBsaW5lMik7XG5cbiAgICAvLyBkZWJ1ZyhsaW5lMSwgbGluZTEsIGNtcCk7XG4gICAgLy8gZGVidWcobGluZVJlYWRlcjEubmV4dFZhbHVlLCBsaW5lUmVhZGVyMi5uZXh0VmFsdWUsICduZXh0JywgbGluZVJlYWRlcjEuZW9mLCBsaW5lUmVhZGVyMi5lb2YpO1xuICAgIC8vIGVtaXQgb24gY29tcGFyZWRcbiAgICB0aGlzLmVtaXQoJ2NvbXBhcmVkJywgbGluZTEsIGxpbmUyLCBjbXAsIGxpbmVSZWFkZXIxLCBsaW5lUmVhZGVyMik7XG5cbiAgICAvLyBlcXVhbHM6IGluY3IgYm90aCBmaWxlcyB0byBuZXh0IGxpbmVcbiAgICBpZiAoY21wID09PSAwKSB7XG4gICAgICBhd2FpdCBsaW5lUmVhZGVyMS5tb3ZlTmV4dCgpO1xuICAgICAgYXdhaXQgbGluZVJlYWRlcjIubW92ZU5leHQoKTtcbiAgICB9IGVsc2UgaWYgKGNtcCA+IDApIHtcbiAgICAgIC8vIGxpbmUxID4gbGluZTI6IG5ldyBsaW5lIGRldGVjdGVkXG4gICAgICBpZiAoY21wID09PSAxKSB7XG4gICAgICAgIC8vIGlmIGZpbGUyIGVuZGVkIGJlZm9yZSBmaWxlMSwgdGhlbiBmaWxlMiBsb3N0IGxpbmUxXG4gICAgICAgIC8vIGVsc2UgZmlsZTIgaGFzIG5ldyBsaW5lXG4gICAgICAgIGlmIChsaW5lUmVhZGVyMi5lb2YgPiBsaW5lUmVhZGVyMS5lb2YpIHtcbiAgICAgICAgICB0aGlzLmVtaXQoJy0nLCBsaW5lMSwgbGluZVJlYWRlcjEsIGxpbmVSZWFkZXIyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmVtaXQoJysnLCBsaW5lMiwgbGluZVJlYWRlcjEsIGxpbmVSZWFkZXIyKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBpbmNyIEZpbGUyIHRvIG5leHQgbGluZVxuICAgICAgYXdhaXQgbGluZVJlYWRlcjIubW92ZU5leHQoKTtcbiAgICB9IGVsc2UgaWYgKGNtcCA8IDApIHtcbiAgICAgIC8vIGxpbmUxIDwgbGluZTI6IGRlbGV0ZWQgbGluZVxuICAgICAgaWYgKGNtcCA9PT0gLTEpIHtcbiAgICAgICAgLy8gaWYgZmlsZTEgZW5kZWQgYmVmb3JlIGZpbGUyLCB0aGVuIGZpbGUyIGhhcyBuZXcgbGluZVxuICAgICAgICAvLyBlbHNlIGZpbGUxIGxvc3QgYSBsaW5lXG4gICAgICAgIGlmIChsaW5lUmVhZGVyMS5lb2YgPiBsaW5lUmVhZGVyMi5lb2YpIHtcbiAgICAgICAgICB0aGlzLmVtaXQoJysnLCBsaW5lMiwgbGluZVJlYWRlcjEsIGxpbmVSZWFkZXIyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmVtaXQoJy0nLCBsaW5lMSwgbGluZVJlYWRlcjEsIGxpbmVSZWFkZXIyKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBpbmNyIEZpbGUxIHRvIG5leHQgbGluZVxuICAgICAgYXdhaXQgbGluZVJlYWRlcjEubW92ZU5leHQoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==