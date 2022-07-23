"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promisify = void 0;
/**
 * 将小程序的API封装成支持Promise的API, 小程序部分api不支持promise
 * @params fn {Function} 小程序原始API，如wx.login
 */
function promisify(fn) {
    return function (obj) {
        return new Promise(function (resolve, reject) {
            obj.success = function (res) {
                resolve(res);
            };
            obj.fail = function (res) {
                reject(res);
            };
            obj.cancel = function () {
                // 微信jsSdk api有cancel回调
                reject({ errMsg: 'request:cancel' });
            };
            fn(obj);
        });
    };
}
exports.promisify = promisify;
