export declare class TextFileDiffOption {
    skipHeader: boolean;
    compareFn(line1: string, line2: string): 1 | -1 | 0;
}
