"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Geo = void 0;
const Feature_1 = require("../types/Feature");
class Geo extends Feature_1.Feature {
    aspectWrapper;
    constructor(aspectWrapper) {
        super();
        this.aspectWrapper = aspectWrapper;
    }
    searchPoi(value, areaCode, typeCode, indexFrom, count) {
        return this.aspectWrapper.exec('searchPoi', {
            value,
            areaCode,
            typeCode,
            indexFrom,
            count,
        });
    }
}
exports.Geo = Geo;
