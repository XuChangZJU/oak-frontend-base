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
        this.history.push(url, state);
    };
    Navigator.prototype.redirectTo = function (url, state) {
        this.history.replace(url, state);
    };
    Navigator.prototype.naviateBack = function (delta) {
        this.history.go(0 - delta);
    };
    return Navigator;
}(Feature_1.Feature));
exports.Navigator = Navigator;
