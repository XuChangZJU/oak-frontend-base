"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Style = void 0;
const Feature_1 = require("../types/Feature");
class Style extends Feature_1.Feature {
    colorDict;
    constructor(colorDict) {
        super();
        this.colorDict = colorDict;
    }
    getColorDict() {
        return this.colorDict;
    }
}
exports.Style = Style;
;
