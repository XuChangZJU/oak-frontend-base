

export const isIos = window && /iPhone|iPad|iPod/i.test(navigator.userAgent);
export const isAndroid = window && /Android/i.test(navigator.userAgent);
export const isWindowsPhone = window && /Windows Phone/i.test(navigator.userAgent);
//@ts-ignore
export const isPlatform = window && (/Win|Mac|X11|Linux/i.test(navigator.platform) || /Win|Mac|X11|Linux/i.test(navigator.userAgentData?.platform));
export const isPc = window && !navigator.userAgent.match(/(Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone)/i)

//是否在微信内置浏览器
export const isWeiXin = window && /MicroMessenger/i.test(navigator.userAgent);
//是否在微信开发者工具
export const isWeiXinDevTools = window && /wechatdevtools/i.test(navigator.userAgent);
//是否在微信小程序内
//@ts-ignore
export const isWeiXinMp = window && window.__wxjs_environment === 'miniprogram' || /miniProgram/i.test(navigator.userAgent);
