"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crud_1 = require("./crud");
const amap_1 = require("./amap");
const aspectDict = {
    operate: crud_1.operate,
    select: crud_1.select,
    amap: amap_1.amap,
};
exports.default = aspectDict;
