/// <reference types="node" />
import { EventEmitter } from 'events';
import { TextFileDiffOption } from './types';
import { PathLike } from 'fs';
import LineByLine = require('n-readlines');
export declare class MyLineReader extends LineByLine {
    val: string;
    nextVal: string;
    lineNumber: number;
    myFile: string | undefined;
    charset: any;
    eof: number;
    constructor(file: PathLike | number);
    moveNext(): string;
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
    diff(file1: string, file2: string): this;
    doCompareLineReader(lineReader1: MyLineReader, lineReader2: MyLineReader): void;
}
