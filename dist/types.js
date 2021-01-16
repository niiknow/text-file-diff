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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdHlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsTUFBYSxrQkFBa0I7SUFBL0I7UUFDQyxlQUFVLEdBQVksS0FBSyxDQUFDO1FBQzVCLFlBQU8sR0FBUSxNQUFNLENBQUM7SUFJdkIsQ0FBQztJQUhBLFNBQVMsQ0FBRSxLQUFhLEVBQUUsS0FBYTtRQUN0QyxPQUFPLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckQsQ0FBQztDQUNEO0FBTkQsZ0RBTUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuXG5leHBvcnQgY2xhc3MgVGV4dEZpbGVEaWZmT3B0aW9uIHtcblx0c2tpcEhlYWRlcjogYm9vbGVhbiA9IGZhbHNlO1xuXHRjaGFyc2V0OiBhbnkgPSAndXRmOCc7XG5cdGNvbXBhcmVGbiAobGluZTE6IHN0cmluZywgbGluZTI6IHN0cmluZykge1xuXHRcdHJldHVybiBsaW5lMSA+IGxpbmUyID8gMSA6IChsaW5lMSA8IGxpbmUyID8gLTEgOiAwKTtcblx0fVxufVxuIl19