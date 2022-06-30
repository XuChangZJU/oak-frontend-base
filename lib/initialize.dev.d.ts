/**
 * 此文件是为了vs code能正确定位，在webpack编译时应该跳过，直接去获取initialize.dev.mp.ts获initialize.dev.web.ts
 */
import { initialize as initMp } from './initialize.dev.mp';
export declare const initialize: typeof initMp;
