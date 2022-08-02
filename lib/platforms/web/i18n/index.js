"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getI18next = void 0;
/**
 * Created by Administrator on 2018/3/24.
 */
var i18next_1 = __importDefault(require("i18next"));
var i18next_http_backend_1 = __importDefault(require("i18next-http-backend"));
var i18next_chained_backend_1 = __importDefault(require("i18next-chained-backend"));
var i18next_localstorage_backend_1 = __importDefault(require("i18next-localstorage-backend")); // primary use cache
var i18next_browser_languagedetector_1 = __importDefault(require("i18next-browser-languagedetector"));
var react_i18next_1 = require("react-i18next");
var lodash_1 = require("lodash");
var keys_ondemand_1 = __importDefault(require("./keys-ondemand"));
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
    return __awaiter(this, void 0, void 0, function () {
        var url, response, json, result;
        return __generator(this, function (_a) {
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
