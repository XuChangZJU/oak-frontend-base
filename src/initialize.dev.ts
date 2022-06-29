/**
 * 此文件是为了vs code能正确定位，在webpack编译时应该跳过，直接去获取initialize.dev.mp.ts获initialize.dev.web.ts
 */
import { initialize as initMp } from './initialize.dev.mp';

console.log('不应该跑到这里');
export const initialize = initMp;
