/**
 * 将小程序的API封装成支持Promise的API, 小程序部分api不支持promise
 * @params fn {Function} 小程序原始API，如wx.login
 */
export declare function promisify(fn: any): (obj: any) => Promise<object>;
