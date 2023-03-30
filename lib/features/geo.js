"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Geo = void 0;
var tslib_1 = require("tslib");
var Feature_1 = require("../types/Feature");
var Geo = /** @class */ (function (_super) {
    tslib_1.__extends(Geo, _super);
    function Geo(aspectWrapper) {
        var _this = _super.call(this) || this;
        _this.aspectWrapper = aspectWrapper;
        return _this;
    }
    Geo.prototype.searchPoi = function (value, areaCode, typeCode, indexFrom, count) {
        return this.aspectWrapper.exec('searchPoi', {
            value: value,
            areaCode: areaCode,
            typeCode: typeCode,
            indexFrom: indexFrom,
            count: count,
        });
    };
    return Geo;
}(Feature_1.Feature));
exports.Geo = Geo;
