"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getI18next = void 0;
/**
 * Created by Administrator on 2018/3/24.
 */
const assert_1 = __importDefault(require("assert"));
const i18next_1 = __importDefault(require("i18next"));
const i18next_http_backend_1 = __importDefault(require("i18next-http-backend"));
const i18next_chained_backend_1 = __importDefault(require("i18next-chained-backend"));
const i18next_localstorage_backend_1 = __importDefault(require("i18next-localstorage-backend")); // primary use cache
const i18next_browser_languagedetector_1 = __importDefault(require("i18next-browser-languagedetector"));
const react_i18next_1 = require("react-i18next");
const lodash_1 = require("lodash");
const keys_ondemand_1 = __importDefault(require("./keys-ondemand"));
/**
 * I18N语言包设计思路：
 * 1）在本地缓存中查找
 * 2）通过xhr请求服务器上的ns文件
 * 3）若服务器的ns版本作了动态更新，在一个key发生miss的时候再请求一次
 * @type {string}
 */
const LOCAL_STORE_PREFIX = 'i18next_res_';
/**
 * 当一个ns下的key发生了miss的处理
 * 当用户本地缓存的ns文件和远端的ns文件不一致时才会发生，此时先获得整个新的ns文件的内容，储存在本地
 * todo 可以做成增量获取，但现在没必要 by Xc
 * @param keys
 * @param language
 * @param namespace
 * @returns {Promise}
 */
async function translationService(keys, language, namespace) {
    const url = `${process.env.PUBLIC_URL}/locales/${language}/${namespace}.json`;
    const response = await fetch(url);
    const json = await response.json();
    if (window.localStorage) {
        try {
            window.localStorage.setItem(`${LOCAL_STORE_PREFIX}${language}-${namespace}`, JSON.stringify(json));
        }
        catch (e) {
            // f.log('failed to set value for key "' + key + '" to localStorage.');
        }
    }
    const result = {};
    keys.forEach((k) => {
        const v = (0, lodash_1.get)(json, k);
        if (process.env.NODE_ENV !== 'production') {
            (0, assert_1.default)(v, `[i18n]:${namespace}-${k}最新的服务器数据中无此键值`);
        }
        (0, lodash_1.assign)(result, { [k]: v });
    });
    return result;
}
function getI18nextInitOptions(options) {
    const { version = '1.0.0' } = options || {};
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
                    loadPath: `${process.env.PUBLIC_URL}/locales/{{lng}}/{{ns}}.json`,
                },
            ],
        },
        returnObjects: true,
        joinArrays: true,
        saveMissing: true,
    };
}
function getI18next(options) {
    const i18nextInitOptions = getI18nextInitOptions(options);
    i18next_1.default
        .use(new keys_ondemand_1.default({
        translationGetter: translationService,
    }))
        .use(i18next_chained_backend_1.default)
        .use(i18next_browser_languagedetector_1.default)
        .use(react_i18next_1.initReactI18next) // if not using I18nextProvider
        .init(i18nextInitOptions, (err) => {
        // console.log(err);
    });
    return i18next_1.default;
}
exports.getI18next = getI18next;
;
