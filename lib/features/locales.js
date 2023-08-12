"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Locales = void 0;
var tslib_1 = require("tslib");
var Feature_1 = require("../types/Feature");
var LS_LNG_KEY = 'ofb-feature-locale-lng';
var Locales = /** @class */ (function (_super) {
    tslib_1.__extends(Locales, _super);
    function Locales(cache, localStorage, environment, makeBridgeUrlFn) {
        var _this = _super.call(this) || this;
        _this.cache = cache;
        _this.localStorage = localStorage;
        _this.environment = environment;
        var savedLng = localStorage.load(LS_LNG_KEY);
        if (savedLng) {
            _this.language = savedLng;
        }
        else {
            _this.language = 'zh_CN';
            _this.detectLanguange();
        }
        _this.makeBridgeUrlFn = makeBridgeUrlFn;
        return _this;
    }
    Locales.prototype.detectLanguange = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var env, language;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.environment.getEnv()];
                    case 1:
                        env = _a.sent();
                        language = env.language;
                        this.language = language;
                        this.localStorage.save(LS_LNG_KEY, language);
                        return [2 /*return*/];
                }
            });
        });
    };
    Locales.prototype.t = function (namespace, key, params) {
        // todo
    };
    // 这个是临时的代码，等和auth线合并了再移到合适的feature里去
    Locales.prototype.makeBridgeUrl = function (url, headers) {
        if (this.makeBridgeUrlFn) {
            return this.makeBridgeUrlFn(url, headers);
        }
        console.warn('development模式下无法使用bridge，直接使用原始url', url);
        return url;
    };
    return Locales;
}(Feature_1.Feature));
exports.Locales = Locales;
