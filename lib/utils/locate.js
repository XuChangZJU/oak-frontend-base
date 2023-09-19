"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locate = void 0;
const utils_1 = require("./utils");
async function locateWechat() {
    return wx.getLocation({});
}
async function locateWeb() {
    if ('geolocation' in navigator) {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition((position) => {
                resolve(position.coords);
            }, (err) => {
                console.error(err);
                reject(err);
            });
        });
    }
    else {
        throw new Error('浏览器不支持定位');
    }
}
async function locate() {
    if (utils_1.isWeiXin) {
        // 先尝试微信定位
        try {
            const result = await locateWechat();
            return result;
        }
        catch (err) {
            console.warn(err);
            const result2 = await locateWeb();
            return result2;
        }
    }
    else {
        const result2 = await locateWeb();
        return result2;
    }
}
exports.locate = locate;
