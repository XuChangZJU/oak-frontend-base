"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = exports.subscribe = exports.Feature = void 0;
var tslib_1 = require("tslib");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var mCallbacks = [];
var mActionStackDepth = 0;
var Feature = /** @class */ (function () {
    function Feature() {
    }
    return Feature;
}());
exports.Feature = Feature;
;
function subscribe(callback) {
    mCallbacks.push(callback);
    return function () {
        (0, lodash_1.pull)(mCallbacks, callback);
    };
}
exports.subscribe = subscribe;
/**
 * 方法注解，使函数调用最后一层堆栈时唤起所有登记的回调
 * @param target
 * @param propertyName
 * @param descriptor
 */
function Action(target, propertyName, descriptor) {
    var method = descriptor.value;
    descriptor.value = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result, err_1, results;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mActionStackDepth++;
                        if (mActionStackDepth > 1000) {
                            console.error("action[".concat(method.name, "]\u8C03\u7528\u7684\u5C42\u7EA7\u8D85\u8FC7\u4E8620\uFF0C\u8BF7\u68C0\u67E5\u662F\u5426\u5B58\u5728\u65E0\u9650\u9012\u5F52"));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        result = method.apply(this, params);
                        if (!(result instanceof Promise)) return [3 /*break*/, 3];
                        return [4 /*yield*/, result];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        console.error("\u65B9\u6CD5".concat(method.name, "\u88AB\u5B9A\u4E49\u4E3Aaction\u4F46\u4E0D\u662F\u5F02\u6B65\u51FD\u6570\uFF0C\u53EF\u80FD\u4F1A\u5F15\u8D77\u5BF9\u8C61\u89E3\u6784\u548C\u91CD\u6E32\u67D3\u4E4B\u95F4\u7684\u4E0D\u6B63\u786E\u540C\u6B65"));
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        err_1 = _a.sent();
                        // console.error(err, method.name);
                        mActionStackDepth--;
                        throw err_1;
                    case 6:
                        mActionStackDepth--;
                        if (!(mActionStackDepth === 0)) return [3 /*break*/, 8];
                        results = mCallbacks.map(function (ele) { return ele(); }).filter(function (ele) { return ele instanceof Promise; });
                        if (!(results.length > 0)) return [3 /*break*/, 8];
                        return [4 /*yield*/, Promise.all(results)];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [2 /*return*/, result];
                }
            });
        });
    };
}
exports.Action = Action;
