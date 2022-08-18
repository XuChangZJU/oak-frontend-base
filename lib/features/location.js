"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Location = void 0;
var tslib_1 = require("tslib");
var Feature_1 = require("../types/Feature");
var Location = /** @class */ (function (_super) {
    tslib_1.__extends(Location, _super);
    function Location() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Location.prototype.get = function (acceptableLatency) {
        if (acceptableLatency === void 0) { acceptableLatency = 10000; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.lastTimestamp && Date.now() - this.lastTimestamp < acceptableLatency) {
                            return [2 /*return*/, {
                                    latitude: this.latitude,
                                    longitude: this.longitude,
                                }];
                        }
                        if (!(process.env.OAK_PLATFORM === 'wechatMp')) return [3 /*break*/, 2];
                        return [4 /*yield*/, wx.getLocation({
                                type: 'gcj02'
                            })];
                    case 1:
                        result = _a.sent();
                        this.latitude = result.latitude;
                        this.longitude = result.longitude;
                        this.lastTimestamp = Date.now();
                        return [2 /*return*/, {
                                latitude: this.latitude,
                                longitude: this.longitude,
                            }];
                    case 2: throw new Error('Method not implemented.');
                }
            });
        });
    };
    Location.prototype.refresh = function () {
        throw new Error('Method not implemented.');
    };
    tslib_1.__decorate([
        Feature_1.Action
    ], Location.prototype, "refresh", null);
    return Location;
}(Feature_1.Feature));
exports.Location = Location;
