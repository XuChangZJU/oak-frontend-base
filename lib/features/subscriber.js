"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubScriber = void 0;
var tslib_1 = require("tslib");
var assert_1 = require("oak-domain/lib/utils/assert");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var socket_io_1 = tslib_1.__importDefault(require("../utils/socket.io/socket.io"));
var Feature_1 = require("../types/Feature");
var SubScriber = /** @class */ (function (_super) {
    tslib_1.__extends(SubScriber, _super);
    function SubScriber(cache, getSubscribePointFn) {
        var _this = _super.call(this) || this;
        _this.callbackMap = {};
        _this.socketState = 'unconnected';
        _this.eventCallbackMap = {
            connect: [],
            disconnect: [],
        };
        _this.cache = cache;
        _this.getSubscribePointFn = getSubscribePointFn;
        return _this;
    }
    SubScriber.prototype.on = function (event, callback) {
        this.eventCallbackMap[event].push(callback);
    };
    SubScriber.prototype.off = function (event, callback) {
        (0, lodash_1.pull)(this.eventCallbackMap[event], callback);
    };
    SubScriber.prototype.emit = function (event) {
        this.eventCallbackMap[event].forEach(function (ele) { return ele(); });
    };
    SubScriber.prototype.initSocketOption = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, url, path, socket;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getSubscribePointFn()];
                    case 1:
                        _a = _b.sent(), url = _a.url, path = _a.path;
                        socket = (0, socket_io_1.default)(url, {
                            path: path,
                        });
                        this.socket = socket;
                        return [2 /*return*/];
                }
            });
        });
    };
    SubScriber.prototype.login = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    SubScriber.prototype.connect = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var optionInited, socket;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        optionInited = false;
                        if (!!this.socket) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initSocketOption()];
                    case 1:
                        _a.sent();
                        optionInited = true;
                        _a.label = 2;
                    case 2:
                        socket = this.socket;
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                /**
                                 * https://socket.io/zh-CN/docs/v4/client-socket-instance/
                                 */
                                socket.on('connect', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                    var _this = this;
                                    return tslib_1.__generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                // 验证身份
                                                this.socketState = 'connected';
                                                this.emit('connect');
                                                socket.off('connect');
                                                socket.on('disconnect', function () {
                                                    _this.socketState = 'unconnected';
                                                    _this.emit('disconnect');
                                                    socket.removeAllListeners();
                                                    if (Object.keys(_this.callbackMap).length > 0) {
                                                        _this.connect();
                                                    }
                                                });
                                                return [4 /*yield*/, this.login()];
                                            case 1:
                                                _a.sent();
                                                resolve(undefined);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); });
                                if (!optionInited) {
                                    var count_1 = 0;
                                    socket.on('connect_error', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                        return tslib_1.__generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    count_1++;
                                                    if (!(count_1 > 10)) return [3 /*break*/, 2];
                                                    // 可能socket地址改变了，刷新重连
                                                    socket.removeAllListeners();
                                                    socket.disconnect();
                                                    this.socket = undefined;
                                                    return [4 /*yield*/, this.connect()];
                                                case 1:
                                                    _a.sent();
                                                    resolve(undefined);
                                                    _a.label = 2;
                                                case 2: return [2 /*return*/];
                                            }
                                        });
                                    }); });
                                }
                                socket.connect();
                            })];
                }
            });
        });
    };
    SubScriber.prototype.sub = function (data, callback) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var ids;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                ids = data.map(function (ele) { return ele.id; });
                if (callback) {
                    ids.forEach(function (id) {
                        (0, assert_1.assert)(!_this.callbackMap[id], "[subscriber]\u6CE8\u518C\u56DE\u8C03\u7684id".concat(id, "\u53D1\u751F\u91CD\u590D"));
                        _this.callbackMap[id] = callback;
                    });
                }
                if (this.socketState === 'unconnected') {
                    this.connect();
                }
                else if (this.socketState === 'connected') {
                    (_a = this.socket) === null || _a === void 0 ? void 0 : _a.emit('sub', data);
                }
                return [2 /*return*/];
            });
        });
    };
    SubScriber.prototype.unsub = function (ids) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                ids.forEach(function (id) { return (0, lodash_1.omit)(_this.callbackMap, id); });
                if (this.socketState === 'connected') {
                    this.socket.emit('unsub', ids);
                }
                if (this.socketState !== 'unconnected') {
                    if (Object.keys(this.callbackMap).length === 0) {
                        this.socket.disconnect();
                        this.socket.removeAllListeners();
                        this.socketState = 'unconnected';
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    return SubScriber;
}(Feature_1.Feature));
exports.SubScriber = SubScriber;
