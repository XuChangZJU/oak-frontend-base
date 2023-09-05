/**
 * 将小程序的API封装成支持Promise的API, 小程序部分api不支持promise
 * @params fn {Function} 小程序原始API，如wx.login
 */
export function promisify(fn) {
    return function (obj) {
        return new Promise((resolve, reject) => {
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
