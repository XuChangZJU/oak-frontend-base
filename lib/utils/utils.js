"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWeiXinMp = exports.isWeiXinDevTools = exports.isWeiXin = exports.isPc = exports.isPlatform = exports.isWindowsPhone = exports.isAndroid = exports.isIos = void 0;
exports.isIos = window && /iPhone|iPad|iPod/i.test(navigator.userAgent);
exports.isAndroid = window && /Android/i.test(navigator.userAgent);
exports.isWindowsPhone = window && /Windows Phone/i.test(navigator.userAgent);
//@ts-ignore
exports.isPlatform = window && (/Win|Mac|X11|Linux/i.test(navigator.platform) || /Win|Mac|X11|Linux/i.test(navigator.userAgentData?.platform));
exports.isPc = window && !navigator.userAgent.match(/(Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone)/i);
//是否在微信内置浏览器
exports.isWeiXin = window && /MicroMessenger/i.test(navigator.userAgent);
//是否在微信开发者工具
exports.isWeiXinDevTools = window && /wechatdevtools/i.test(navigator.userAgent);
//是否在微信小程序内
//@ts-ignore
exports.isWeiXinMp = window && window.__wxjs_environment === 'miniprogram' || /miniProgram/i.test(navigator.userAgent);
