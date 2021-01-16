export declare class TextFileDiffOption {
    skipHeader: boolean;
    charset: any;
    compareFn(line1: string, line2: string): 1 | -1 | 0;
}
