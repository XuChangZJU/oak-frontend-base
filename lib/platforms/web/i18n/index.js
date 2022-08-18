"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getI18next = void 0;
var tslib_1 = require("tslib");
/**
 * Created by Administrator on 2018/3/24.
 */
var i18next_1 = tslib_1.__importDefault(require("i18next"));
var i18next_http_backend_1 = tslib_1.__importDefault(require("i18next-http-backend"));
var i18next_chained_backend_1 = tslib_1.__importDefault(require("i18next-chained-backend"));
var i18next_localstorage_backend_1 = tslib_1.__importDefault(require("i18next-localstorage-backend")); // primary use cache
var i18next_browser_languagedetector_1 = tslib_1.__importDefault(require("i18next-browser-languagedetector"));
var react_i18next_1 = require("react-i18next");
var lodash_1 = require("lodash");
var keys_ondemand_1 = tslib_1.__importDefault(require("./keys-ondemand"));
/**
 * I18N语言包设计思路：
 * 1）在本地缓存中查找
 * 2）通过xhr请求服务器上的ns文件
 * 3）若服务器的ns版本作了动态更新，在一个key发生miss的时候再请求一次
 * @type {string}
 */
var LOCAL_STORE_PREFIX = 'i18next_res_';
/**
 * 当一个ns下的key发生了miss的处理
 * 当用户本地缓存的ns文件和远端的ns文件不一致时才会发生，此时先获得整个新的ns文件的内容，储存在本地
 * todo 可以做成增量获取，但现在没必要 by Xc
 * @param keys
 * @param language
 * @param namespace
 * @returns {Promise}
 */
function translationService(keys, language, namespace) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var url, response, json, result;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "".concat(process.env.PUBLIC_URL, "/locales/").concat(language, "/").concat(namespace, ".json");
                    return [4 /*yield*/, fetch(url)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    json = _a.sent();
                    if (window.localStorage) {
                        try {
                            window.localStorage.setItem("".concat(LOCAL_STORE_PREFIX).concat(language, "-").concat(namespace), JSON.stringify(json));
                        }
                        catch (e) {
                            // f.log('failed to set value for key "' + key + '" to localStorage.');
                        }
                    }
                    result = {};
                    keys.forEach(function (k) {
                        var _a;
                        var v = (0, lodash_1.get)(json, k);
                        if (process.env.NODE_ENV !== 'production' && !v) {
                            console.warn(v, "[i18n]:".concat(namespace, "-").concat(k, "\u6700\u65B0\u7684\u670D\u52A1\u5668\u6570\u636E\u4E2D\u65E0\u6B64\u952E\u503C"));
                        }
                        (0, lodash_1.assign)(result, (_a = {}, _a[k] = v, _a));
                    });
                    return [2 /*return*/, result];
            }
        });
    });
}
function getI18nextInitOptions(options) {
    var _a = (options || {}).version, version = _a === void 0 ? '1.0.0' : _a;
    return {
        debug: process.env.NODE_ENV !== 'production',
        fallbackLng: 'zh_CN',
        ns: ['common', 'error'],
        lng: 'zh_CN',
        load: 'currentOnly',
        defaultNS: 'common',
        interpolation: {
            escapeValue: false, // not needed for react!!
        },
        // react i18next special options (optional)
        react: {
            // wait: true,
            bindI18n: 'added languageChanged',
            bindI18nStore: 'added',
            nsMode: 'default',
            useSuspense: true,
        },
        backend: {
            backends: [
                i18next_localstorage_backend_1.default,
                i18next_http_backend_1.default, // fallback
            ],
            backendOptions: [
                {
                    // prefix for stored languages
                    prefix: LOCAL_STORE_PREFIX,
                    // expiration
                    expirationTime: process.env.NODE_ENV !== 'production'
                        ? 120 * 1000
                        : 300 * 24 * 3600 * 1000,
                    defaultVersion: version,
                },
                {
                    // for all available options read the backend's repository readme file
                    loadPath: "".concat(process.env.PUBLIC_URL, "/locales/{{lng}}/{{ns}}.json"),
                },
            ],
        },
        returnObjects: true,
        joinArrays: true,
        saveMissing: true,
    };
}
function getI18next(options) {
    var i18nextInitOptions = getI18nextInitOptions(options);
    i18next_1.default
        .use(new keys_ondemand_1.default({
        translationGetter: translationService,
    }))
        .use(i18next_chained_backend_1.default)
        .use(i18next_browser_languagedetector_1.default)
        .use(react_i18next_1.initReactI18next) // if not using I18nextProvider
        .init(i18nextInitOptions, function (err) {
        // console.log(err);
    });
    return i18next_1.default;
}
exports.getI18next = getI18next;
;
