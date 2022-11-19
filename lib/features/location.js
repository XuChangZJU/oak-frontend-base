"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Location = void 0;
var tslib_1 = require("tslib");
var Feature_1 = require("../types/Feature");
var Location = /** @class */ (function (_super) {
    tslib_1.__extends(Location, _super);
    function Location(acceptableLatency) {
        var _this = _super.call(this) || this;
        _this.acceptableLatency = acceptableLatency || 1000;
        return _this;
    }
    Location.prototype.get = function () {
        return {
            latitude: this.latitude,
            longitude: this.longitude,
            lastTimestamp: this.lastTimestamp,
        };
    };
    Location.prototype.refresh = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result, getGeolocation, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(process.env.OAK_PLATFORM === 'wechatMp')) return [3 /*break*/, 2];
                        return [4 /*yield*/, wx.getLocation({
                                type: 'gcj02',
                            })];
                    case 1:
                        result = _a.sent();
                        this.latitude = result.latitude;
                        this.longitude = result.longitude;
                        this.lastTimestamp = Date.now();
                        return [3 /*break*/, 4];
                    case 2:
                        getGeolocation = function () {
                            return new Promise(function (resolve, reject) {
                                if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition(function (position) {
                                        // 1. coords.latitude：估计纬度
                                        // 2. coords.longitude：估计经度
                                        // 3. coords.altitude：估计高度
                                        // 4. coords.accuracy：所提供的以米为单位的经度和纬度估计的精确度
                                        // 5. coords.altitudeAccuracy：所提供的以米为单位的高度估计的精确度
                                        // 6. coords.heading： 宿主设备当前移动的角度方向，相对于正北方向顺时针计算
                                        // 7. coords.speed：以米每秒为单位的设备的当前对地速度
                                        var coords = position.coords;
                                        var location = {
                                            accuracy: coords.accuracy,
                                            altitude: coords.altitude,
                                            altitudeAccuracy: coords.altitudeAccuracy,
                                            heading: coords.heading,
                                            latitude: coords.latitude,
                                            longitude: coords.longitude,
                                            speed: coords.speed,
                                        };
                                        resolve(location);
                                    }, function (error) {
                                        reject(error);
                                    }, {
                                        // 指示浏览器获取高精度的位置，默认为false
                                        enableHighAccuracy: true,
                                        // 指定获取地理位置的超时时间，默认不限时，单位为毫秒
                                        timeout: 10000,
                                        // 最长有效期，在重复获取地理位置时，此参数指定多久再次获取位置。
                                        maximumAge: 3000,
                                    });
                                }
                                else {
                                    reject('Your browser does not support Geolocation!');
                                }
                            });
                        };
                        return [4 /*yield*/, getGeolocation()];
                    case 3:
                        result = (_a.sent());
                        this.lastTimestamp = Date.now();
                        this.latitude = result.latitude;
                        this.longitude = result.longitude;
                        _a.label = 4;
                    case 4:
                        this.publish();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Location;
}(Feature_1.Feature));
exports.Location = Location;
