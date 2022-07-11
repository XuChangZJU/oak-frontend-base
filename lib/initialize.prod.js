"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
/**
 * 此文件是为了vs code能正确定位，在webpack编译时应该跳过，直接去获取initialize.prod.mp.ts获initialize.prod.web.ts
 */
const initialize_prod_mp_1 = require("./initialize.prod.mp");
console.log('不应该跑到这里');
exports.initialize = initialize_prod_mp_1.initialize;
