"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Locales = void 0;
var tslib_1 = require("tslib");
var Feature_1 = require("../types/Feature");
var Locales = /** @class */ (function (_super) {
    tslib_1.__extends(Locales, _super);
    function Locales(aspectWrapper, makeBridgeUrlFn) {
        var _this = _super.call(this) || this;
        _this.aspectWrapper = aspectWrapper;
        _this.makeBridgeUrlFn = makeBridgeUrlFn;
        return _this;
    }
    Locales.prototype.get = function (namespace, locale, scene) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.aspectWrapper.exec('getTranslations', { namespace: namespace, locale: locale })];
                    case 1:
                        result = (_a.sent()).result;
                        return [2 /*return*/, {
                                translations: result,
                            }];
                }
            });
        });
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
