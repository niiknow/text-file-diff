/// <reference types="node" />
import { EventEmitter } from 'events';
import { TextFileDiffOption } from './types';
import stream from 'stream';
export declare class StreamLineReader {
    value: string;
    nextValue: string;
    lineNumber: number;
    it?: AsyncIterableIterator<string>;
    eof: number;
    init(readStream: stream.Readable): Promise<StreamLineReader>;
    moveNext(): Promise<string>;
}
/**
 * line by line diff of two files
 */
export default class TextFileDiff extends EventEmitter {
    options: TextFileDiffOption;
    constructor(options?: TextFileDiffOption);
    /**
     * run diff
     * @param  String file1 path to file 1
     * @param  String file2 path to file 2
     * @return Object         self
     */
    diff(file1: string, file2: string): Promise<this>;
    /**
     * run diffStream
     * @param  Readable stream1
     * @param  Readable stream2
     * @return Object         self
     */
    diffStream(stream1: stream.Readable, stream2: stream.Readable): Promise<this>;
    doCompareLineReader(lineReader1: StreamLineReader, lineReader2: StreamLineReader): Promise<void>;
}
