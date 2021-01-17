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
        // equals: incr both files to next line
        if (cmpar === 0) {
            await lineReader1.moveNext();
            await lineReader2.moveNext();
        }
        else if (cmpar > 0) {
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
        else {
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
    }
}
exports.default = TextFileDiff;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW9DO0FBQ3BDLG1DQUEyQztBQUMzQywyQkFBOEM7QUFDOUMsdUNBQW9EO0FBR3BELGlDQUFrQztBQUVsQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUV4QyxNQUFhLGdCQUFnQjtJQUE3QjtRQUNFLFVBQUssR0FBVyxFQUFFLENBQUM7UUFDbkIsY0FBUyxHQUFXLEVBQUUsQ0FBQztRQUN2QixlQUFVLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFeEIsUUFBRyxHQUFXLENBQUMsQ0FBQyxDQUFDO0lBNkJuQixDQUFDO0lBNUJDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBMkI7UUFDcEMsTUFBTSxFQUFFLEdBQUcsMEJBQWUsQ0FBQztZQUN6QixLQUFLLEVBQUUsVUFBVTtZQUNqQixTQUFTLEVBQUUsTUFBTSxDQUFDLGlCQUFpQjtTQUNwQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztRQUVyQyxxQkFBcUI7UUFDckIsTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdEIsTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFdEIsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsS0FBSyxDQUFDLFFBQVE7UUFDWixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFFNUIsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXhDLElBQUksVUFBVSxDQUFDLElBQUksRUFBRTtZQUNuQixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDWCxVQUFVLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FB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LEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQzthQUNqRDtZQUVELDBCQUEwQjtZQUMxQixNQUFNLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUM5QjthQUFNO1lBQ0wsOEJBQThCO1lBQzlCLHVEQUF1RDtZQUN2RCx5QkFBeUI7WUFDekIsSUFBSSxXQUFXLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7YUFDakQ7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQzthQUNqRDtZQUVELDBCQUEwQjtZQUMxQixNQUFNLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUM5QjtJQUNILENBQUM7Q0FDRjtBQXZGRCwrQkF1RkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCB7VGV4dEZpbGVEaWZmT3B0aW9ufSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7UGF0aExpa2UsIGNyZWF0ZVJlYWRTdHJlYW19IGZyb20gJ2ZzJztcbmltcG9ydCB7SW50ZXJmYWNlLCBjcmVhdGVJbnRlcmZhY2V9IGZyb20gJ3JlYWRsaW5lJztcbmltcG9ydCBzdHJlYW0gZnJvbSAnc3RyZWFtJztcblxuaW1wb3J0IG15RGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpO1xuXG5jb25zdCBkZWJ1ZyA9IG15RGVidWcoJ3RleHQtZmlsZS1kaWZmJyk7XG5cbmV4cG9ydCBjbGFzcyBTdHJlYW1MaW5lUmVhZGVyIHtcbiAgdmFsdWU6IHN0cmluZyA9ICcnO1xuICBuZXh0VmFsdWU6IHN0cmluZyA9ICcnO1xuICBsaW5lTnVtYmVyOiBudW1iZXIgPSAtMTtcbiAgaXQ/OiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8c3RyaW5nPjtcbiAgZW9mOiBudW1iZXIgPSAtMTtcbiAgYXN5bmMgaW5pdChyZWFkU3RyZWFtOiBzdHJlYW0uUmVhZGFibGUpOiBQcm9taXNlPFN0cmVhbUxpbmVSZWFkZXI+IHtcbiAgICBjb25zdCBybCA9IGNyZWF0ZUludGVyZmFjZSh7XG4gICAgICBpbnB1dDogcmVhZFN0cmVhbSxcbiAgICAgIGNybGZEZWxheTogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZXG4gICAgfSk7XG4gICAgdGhpcy5pdCA9IHJsW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuXG4gICAgLy8gbW92ZSB0byBmaXJzdCBsaW5lXG4gICAgYXdhaXQgdGhpcy5tb3ZlTmV4dCgpO1xuICAgIGF3YWl0IHRoaXMubW92ZU5leHQoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYXN5bmMgbW92ZU5leHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICB0aGlzLnZhbHVlID0gdGhpcy5uZXh0VmFsdWU7XG5cbiAgICBjb25zdCBuZXh0UmVzdWx0ID0gYXdhaXQgdGhpcy5pdC5uZXh0KCk7XG5cbiAgICBpZiAobmV4dFJlc3VsdC5kb25lKSB7XG4gICAgICB0aGlzLmVvZisrO1xuICAgICAgbmV4dFJlc3VsdC52YWx1ZSA9ICcnO1xuICAgIH1cblxuICAgIHRoaXMubmV4dFZhbHVlID0gbmV4dFJlc3VsdC52YWx1ZTtcbiAgICB0aGlzLmxpbmVOdW1iZXIrKztcbiAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgfVxufVxuXG4vKipcbiAqIGxpbmUgYnkgbGluZSBkaWZmIG9mIHR3byBmaWxlc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXh0RmlsZURpZmYgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBvcHRpb25zOiBUZXh0RmlsZURpZmZPcHRpb247XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucz86IFRleHRGaWxlRGlmZk9wdGlvbikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5vcHRpb25zID0gbmV3IFRleHRGaWxlRGlmZk9wdGlvbigpO1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5vcHRpb25zLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBydW4gZGlmZlxuICAgKiBAcGFyYW0gIFN0cmluZyBmaWxlMSBwYXRoIHRvIGZpbGUgMVxuICAgKiBAcGFyYW0gIFN0cmluZyBmaWxlMiBwYXRoIHRvIGZpbGUgMlxuICAgKiBAcmV0dXJuIE9iamVjdCAgICAgICAgIHNlbGZcbiAgICovXG4gIGFzeW5jIGRpZmYoZmlsZTE6IHN0cmluZywgZmlsZTI6IHN0cmluZykge1xuICAgIGNvbnN0IHN0cmVhbTEgPSBjcmVhdGVSZWFkU3RyZWFtKGZpbGUxKTtcbiAgICBjb25zdCBzdHJlYW0yID0gY3JlYXRlUmVhZFN0cmVhbShmaWxlMik7XG4gICAgcmV0dXJuIHRoaXMuZGlmZlN0cmVhbShzdHJlYW0xLCBzdHJlYW0yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBydW4gZGlmZlN0cmVhbVxuICAgKiBAcGFyYW0gIFJlYWRhYmxlIHN0cmVhbTFcbiAgICogQHBhcmFtICBSZWFkYWJsZSBzdHJlYW0yXG4gICAqIEByZXR1cm4gT2JqZWN0ICAgICAgICAgc2VsZlxuICAgKi9cbiAgYXN5bmMgZGlmZlN0cmVhbShzdHJlYW0xOiBzdHJlYW0uUmVhZGFibGUsIHN0cmVhbTI6IHN0cmVhbS5SZWFkYWJsZSkge1xuICAgIGNvbnN0IGxpbmVSZWFkZXIxID0gYXdhaXQgKG5ldyBTdHJlYW1MaW5lUmVhZGVyKCkpLmluaXQoc3RyZWFtMSk7XG4gICAgY29uc3QgbGluZVJlYWRlcjIgPSBhd2FpdCAobmV3IFN0cmVhbUxpbmVSZWFkZXIoKSkuaW5pdChzdHJlYW0yKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuc2tpcEhlYWRlcikge1xuICAgICAgYXdhaXQgbGluZVJlYWRlcjEubW92ZU5leHQoKTtcbiAgICAgIGF3YWl0IGxpbmVSZWFkZXIyLm1vdmVOZXh0KCk7XG4gICAgfVxuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tYXdhaXQtaW4tbG9vcCAqL1xuICAgIC8vIHdoaWxlIGJvdGggZmlsZXMgaGFzIHZhbGlkIHZhbCwgY2hlY2sgZW9mIGNvdW50ZXJcbiAgICB3aGlsZSAobGluZVJlYWRlcjEuZW9mIDwgMiAmJiBsaW5lUmVhZGVyMi5lb2YgPCAyKSB7XG4gICAgICBhd2FpdCB0aGlzLmRvQ29tcGFyZUxpbmVSZWFkZXIobGluZVJlYWRlcjEsIGxpbmVSZWFkZXIyKTtcbiAgICB9XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1hd2FpdC1pbi1sb29wICovXG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFzeW5jIGRvQ29tcGFyZUxpbmVSZWFkZXIobGluZVJlYWRlcjE6IFN0cmVhbUxpbmVSZWFkZXIsIGxpbmVSZWFkZXIyOiBTdHJlYW1MaW5lUmVhZGVyKSB7XG4gICAgLy8gZm9yRWFjaCBsaW5lIGluIEZpbGUxLCBjb21wYXJlIHRvIGxpbmUgaW4gRmlsZTJcbiAgICBjb25zdCBsaW5lMSA9IGxpbmVSZWFkZXIxLnZhbHVlO1xuICAgIGNvbnN0IGxpbmUyID0gbGluZVJlYWRlcjIudmFsdWU7XG4gICAgY29uc3QgY21wYXIgPSB0aGlzLm9wdGlvbnMuY29tcGFyZUZuKGxpbmUxLCBsaW5lMik7XG5cbiAgICAvLyBkZWJ1ZyhsaW5lMSwgbGluZTEsIGNtcGFyKTtcbiAgICAvLyBkZWJ1ZyhsaW5lUmVhZGVyMS5uZXh0VmFsdWUsIGxpbmVSZWFkZXIyLm5leHRWYWx1ZSwgJ25leHQnLCBsaW5lUmVhZGVyMS5lb2YsIGxpbmVSZWFkZXIyLmVvZik7XG4gICAgLy8gZW1pdCBvbiBjb21wYXJlZFxuICAgIHRoaXMuZW1pdCgnY29tcGFyZWQnLCBsaW5lMSwgbGluZTIsIGNtcGFyLCBsaW5lUmVhZGVyMSwgbGluZVJlYWRlcjIpO1xuXG4gICAgLy8gZXF1YWxzOiBpbmNyIGJvdGggZmlsZXMgdG8gbmV4dCBsaW5lXG4gICAgaWYgKGNtcGFyID09PSAwKSB7XG4gICAgICBhd2FpdCBsaW5lUmVhZGVyMS5tb3ZlTmV4dCgpO1xuICAgICAgYXdhaXQgbGluZVJlYWRlcjIubW92ZU5leHQoKTtcbiAgICB9IGVsc2UgaWYgKGNtcGFyID4gMCkge1xuICAgICAgLy8gbGluZTEgPiBsaW5lMjogbmV3IGxpbmUgZGV0ZWN0ZWRcbiAgICAgIC8vIGlmIGZpbGUyIGVuZGVkIGJlZm9yZSBmaWxlMSwgdGhlbiBmaWxlMiBsb3N0IGxpbmUxXG4gICAgICAvLyBlbHNlIGZpbGUyIGhhcyBuZXcgbGluZVxuICAgICAgaWYgKGxpbmVSZWFkZXIyLmVvZiA+IGxpbmVSZWFkZXIxLmVvZikge1xuICAgICAgICB0aGlzLmVtaXQoJy0nLCBsaW5lMSwgbGluZVJlYWRlcjEsIGxpbmVSZWFkZXIyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZW1pdCgnKycsIGxpbmUyLCBsaW5lUmVhZGVyMSwgbGluZVJlYWRlcjIpO1xuICAgICAgfVxuXG4gICAgICAvLyBpbmNyIEZpbGUyIHRvIG5leHQgbGluZVxuICAgICAgYXdhaXQgbGluZVJlYWRlcjIubW92ZU5leHQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbGluZTEgPCBsaW5lMjogZGVsZXRlZCBsaW5lXG4gICAgICAvLyBpZiBmaWxlMSBlbmRlZCBiZWZvcmUgZmlsZTIsIHRoZW4gZmlsZTIgaGFzIG5ldyBsaW5lXG4gICAgICAvLyBlbHNlIGZpbGUxIGxvc3QgYSBsaW5lXG4gICAgICBpZiAobGluZVJlYWRlcjEuZW9mID4gbGluZVJlYWRlcjIuZW9mKSB7XG4gICAgICAgIHRoaXMuZW1pdCgnKycsIGxpbmUyLCBsaW5lUmVhZGVyMSwgbGluZVJlYWRlcjIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lbWl0KCctJywgbGluZTEsIGxpbmVSZWFkZXIxLCBsaW5lUmVhZGVyMik7XG4gICAgICB9XG5cbiAgICAgIC8vIGluY3IgRmlsZTEgdG8gbmV4dCBsaW5lXG4gICAgICBhd2FpdCBsaW5lUmVhZGVyMS5tb3ZlTmV4dCgpO1xuICAgIH1cbiAgfVxufVxuIl19