"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navigator = void 0;
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
var url_1 = tslib_1.__importDefault(require("url"));
var Feature_1 = require("../types/Feature");
var Navigator = /** @class */ (function (_super) {
    tslib_1.__extends(Navigator, _super);
    function Navigator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Navigator.prototype.constructUrl = function (url, state) {
        var urlParse = url_1.default.parse(url, true);
        var _a = urlParse, pathname = _a.pathname, search = _a.search;
        if (!/^\/{1}/.test(pathname)) {
            (0, assert_1.default)(false, 'url前面必须以/开头');
        }
        // 格式:/house/list 前面加上/pages 后面加上/index
        if ((pathname === null || pathname === void 0 ? void 0 : pathname.indexOf('pages')) !== -1 ||
            (pathname === null || pathname === void 0 ? void 0 : pathname.lastIndexOf('index')) !== -1) {
            (0, assert_1.default)(false, 'url两边不需要加上/pages和/index');
        }
        var pathname2 = "/pages".concat(pathname, "/index");
        var search2 = search;
        if (state) {
            for (var param in state) {
                if (!search2) {
                    search2 = '?';
                }
                if (state[param] !== undefined) {
                    search2 += "&".concat(param, "=").concat(typeof state[param] === 'string'
                        ? state[param]
                        : JSON.stringify(state[param]));
                }
            }
        }
        var url2 = url_1.default.format({
            pathname: pathname2,
            search: search2,
        });
        return url2;
    };
    Navigator.prototype.navigateTo = function (options, state) {
        var url = options.url, rest = tslib_1.__rest(options, ["url"]);
        var url2 = this.constructUrl(url, Object.assign({}, rest, state));
        return new Promise(function (resolve, reject) {
            wx.navigateTo({
                url: url2,
                success: function () { return resolve(undefined); },
                fail: function (err) { return reject(err); },
            });
        });
    };
    Navigator.prototype.redirectTo = function (options, state) {
        var url = options.url, rest = tslib_1.__rest(options, ["url"]);
        var url2 = this.constructUrl(url, Object.assign({}, rest, state));
        return new Promise(function (resolve, reject) {
            wx.redirectTo({
                url: url2,
                success: function () { return resolve(undefined); },
                fail: function (err) { return reject(err); },
            });
        });
    };
    Navigator.prototype.navigateBack = function (delta) {
        return new Promise(function (resolve, reject) {
            wx.navigateBack({
                delta: delta || 1,
                success: function () { return resolve(undefined); },
                fail: function (err) { return reject(err); },
            });
        });
    };
    return Navigator;
}(Feature_1.Feature));
exports.Navigator = Navigator;
