"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
/**
 * 此文件是为了vs code能正确定位，在webpack编译时应该跳过，直接去获取initialize.dev.mp.ts获initialize.dev.web.ts
 */
var initialize_dev_mp_1 = require("./initialize.dev.mp");
console.log('不应该跑到这里');
exports.initialize = initialize_dev_mp_1.initialize;
