/// <reference types="node" />
import { EventEmitter } from 'events';
import { TextFileDiffOption } from './types';
export declare class StreamLineReader {
    value: string;
    nextValue: string;
    lineNumber: number;
    charset: any;
    it?: AsyncIterableIterator<string>;
    eof: number;
    init(readStream: NodeJS.ReadableStream): Promise<StreamLineReader>;
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
     * @param  NodeJS.ReadableStream stream1
     * @param  NodeJS.ReadableStream stream2
     * @return Object         self
     */
    diffStream(stream1: NodeJS.ReadableStream, stream2: NodeJS.ReadableStream): Promise<this>;
    doCompareLineReader(lineReader1: StreamLineReader, lineReader2: StreamLineReader): Promise<void>;
}
