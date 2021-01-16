"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextFileDiffOption = void 0;
class TextFileDiffOption {
    constructor() {
        this.skipHeader = false;
        this.charset = 'utf8';
    }
    compareFn(line1, line2) {
        return line1 > line2 ? 1 : (line1 < line2 ? -1 : 0);
    }
}
exports.TextFileDiffOption = TextFileDiffOption;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdHlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsTUFBYSxrQkFBa0I7SUFBL0I7UUFDRSxlQUFVLEdBQVksS0FBSyxDQUFDO1FBQzVCLFlBQU8sR0FBUSxNQUFNLENBQUM7SUFJeEIsQ0FBQztJQUhDLFNBQVMsQ0FBQyxLQUFhLEVBQUUsS0FBYTtRQUNwQyxPQUFPLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEQsQ0FBQztDQUNGO0FBTkQsZ0RBTUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcblxuZXhwb3J0IGNsYXNzIFRleHRGaWxlRGlmZk9wdGlvbiB7XG4gIHNraXBIZWFkZXI6IGJvb2xlYW4gPSBmYWxzZTtcbiAgY2hhcnNldDogYW55ID0gJ3V0ZjgnO1xuICBjb21wYXJlRm4obGluZTE6IHN0cmluZywgbGluZTI6IHN0cmluZykge1xuICAgIHJldHVybiBsaW5lMSA+IGxpbmUyID8gMSA6IChsaW5lMSA8IGxpbmUyID8gLTEgOiAwKTtcbiAgfVxufVxuIl19