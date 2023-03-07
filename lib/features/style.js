"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Style = void 0;
var tslib_1 = require("tslib");
var Feature_1 = require("../types/Feature");
var Style = /** @class */ (function (_super) {
    tslib_1.__extends(Style, _super);
    function Style(colorDict) {
        var _this = _super.call(this) || this;
        _this.colorDict = colorDict;
        return _this;
    }
    Style.prototype.getColorDict = function () {
        return this.colorDict;
    };
    return Style;
}(Feature_1.Feature));
exports.Style = Style;
;
