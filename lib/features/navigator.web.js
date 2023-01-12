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
        _this.namespace = '';
        return _this;
    }
    /**
     * 必须使用这个方法注入history才能和react-router兼容
     * @param history
     */
    Navigator.prototype.setHistory = function (history) {
        this.history = history;
    };
    Navigator.prototype.setNamespace = function (namespace) {
        this.namespace = namespace;
    };
    Navigator.prototype.getLocation = function () {
        return this.history.location;
    };
    Navigator.prototype.getNamespace = function () {
        return this.namespace;
    };
    Navigator.prototype.navigateTo = function (options, state, disableNamespace) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var url;
            return tslib_1.__generator(this, function (_a) {
                url = this.getUrl(options, disableNamespace);
                this.history.push(url, state);
                return [2 /*return*/];
            });
        });
    };
    Navigator.prototype.redirectTo = function (options, state, disableNamespace) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var url;
            return tslib_1.__generator(this, function (_a) {
                url = this.getUrl(options, disableNamespace);
                this.history.replace(url, state);
                return [2 /*return*/];
            });
        });
    };
    Navigator.prototype.navigateBack = function (delta) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                this.history.go(delta ? 0 - delta : -1);
                return [2 /*return*/];
            });
        });
    };
    Navigator.prototype.getUrl = function (options, disableNamespace) {
        var url = options.url, rest = tslib_1.__rest(options, ["url"]);
        var url2 = url;
        for (var param in rest) {
            var param2 = param;
            if (rest[param2] !== undefined) {
                url2 += "".concat(url2.includes('?') ? '&' : '?').concat(param, "=").concat(typeof rest[param2] === 'string'
                    ? rest[param2]
                    : JSON.stringify(rest[param2]));
            }
        }
        if (!disableNamespace && this.namespace) {
            // 处理this.namespace没加“/” 先加上“/”
            var namespace = this.namespace.startsWith('/')
                ? this.namespace
                : "/".concat(this.namespace); // 格式为 /、/console
            var urls = url2.split('?');
            var urls_0 = urls[0] || '';
            if (namespace === '/') {
                url2 = url2;
                // if (urls_0 === '/') {
                //     url2 = url2.substring(1, url2.length);
                // }
            }
            else if (namespace !== '/' && urls_0 === '') {
                url2 = namespace + url2;
            }
            else if (namespace !== '/' && urls_0 === '/') {
                url2 = namespace + url2.substring(1, url2.length);
            }
            else {
                url2 = namespace + (url2.startsWith('/') ? '' : '/') + url2;
            }
            // url2 =
            //     (this.namespace.startsWith('/') ? '' : '/') +
            //     (this.namespace === '/' ? '' : this.namespace) +
            //     (url2.startsWith('/') ? '' : '/') +
            //     url2;
        }
        return url2;
    };
    return Navigator;
}(Feature_1.Feature));
exports.Navigator = Navigator;
