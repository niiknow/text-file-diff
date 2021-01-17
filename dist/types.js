"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextFileDiffOption = void 0;
class TextFileDiffOption {
    constructor() {
        this.skipHeader = false;
    }
    compareFn(line1, line2) {
        return line1 > line2 ? 1 : (line1 < line2 ? -1 : 0);
    }
}
exports.TextFileDiffOption = TextFileDiffOption;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdHlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsTUFBYSxrQkFBa0I7SUFBL0I7UUFDRSxlQUFVLEdBQVksS0FBSyxDQUFDO0lBSTlCLENBQUM7SUFIQyxTQUFTLENBQUMsS0FBYSxFQUFFLEtBQWE7UUFDcEMsT0FBTyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RELENBQUM7Q0FDRjtBQUxELGdEQUtDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5cbmV4cG9ydCBjbGFzcyBUZXh0RmlsZURpZmZPcHRpb24ge1xuICBza2lwSGVhZGVyOiBib29sZWFuID0gZmFsc2U7XG4gIGNvbXBhcmVGbihsaW5lMTogc3RyaW5nLCBsaW5lMjogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGxpbmUxID4gbGluZTIgPyAxIDogKGxpbmUxIDwgbGluZTIgPyAtMSA6IDApO1xuICB9XG59XG4iXX0=