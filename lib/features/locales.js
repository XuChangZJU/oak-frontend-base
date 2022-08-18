"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Locales = void 0;
var tslib_1 = require("tslib");
var Feature_1 = require("../types/Feature");
var Locales = /** @class */ (function (_super) {
    tslib_1.__extends(Locales, _super);
    function Locales() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Locales.prototype.get = function (namespace, locale, scene) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAspectWrapper().exec('getTranslations', { namespace: namespace, locale: locale })];
                    case 1:
                        result = (_a.sent()).result;
                        return [2 /*return*/, {
                                translations: result,
                            }];
                }
            });
        });
    };
    return Locales;
}(Feature_1.Feature));
exports.Locales = Locales;
