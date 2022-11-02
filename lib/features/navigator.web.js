"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navigator = void 0;
var tslib_1 = require("tslib");
var history_1 = require("history");
var Feature_1 = require("../types/Feature");
var Navigator = /** @class */ (function (_super) {
    tslib_1.__extends(Navigator, _super);
    function Navigator() {
        var _this = _super.call(this) || this;
        _this.history = (0, history_1.createBrowserHistory)();
        return _this;
    }
    /**
     * 必须使用这个方法注入history才能和react-router兼容
     * @param history
     */
    Navigator.prototype.setHistory = function (history) {
        this.history = history;
    };
    Navigator.prototype.getLocation = function () {
        return this.history.location;
    };
    Navigator.prototype.navigateTo = function (url, state) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                this.history.push(url, state);
                return [2 /*return*/];
            });
        });
    };
    Navigator.prototype.redirectTo = function (url, state) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                this.history.replace(url, state);
                return [2 /*return*/];
            });
        });
    };
    Navigator.prototype.navigateBack = function (delta) {
        if (delta === void 0) { delta = 1; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                this.history.go(0 - delta);
                return [2 /*return*/];
            });
        });
    };
    return Navigator;
}(Feature_1.Feature));
exports.Navigator = Navigator;
