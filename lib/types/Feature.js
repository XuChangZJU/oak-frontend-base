"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = exports.subscribe = exports.Feature = void 0;
var tslib_1 = require("tslib");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var Feature = /** @class */ (function () {
    function Feature(aspectWrapper) {
        this.aspectWrapper = aspectWrapper;
    }
    Feature.prototype.getAspectWrapper = function () {
        return this.aspectWrapper;
    };
    return Feature;
}());
exports.Feature = Feature;
var mCallbacks = [];
var mActionStackDepth = 0;
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
                        if (mActionStackDepth > 20) {
                            console.error("action[".concat(method.name, "]\u8C03\u7528\u7684\u5C42\u7EA7\u8D85\u8FC7\u4E8620\uFF0C\u8BF7\u68C0\u67E5\u662F\u5426\u5B58\u5728\u65E0\u9650\u9012\u5F52"));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, method.apply(this, params)];
                    case 2:
                        result = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        console.error(err_1, method.name);
                        mActionStackDepth--;
                        throw err_1;
                    case 4:
                        mActionStackDepth--;
                        if (!(mActionStackDepth === 0)) return [3 /*break*/, 6];
                        results = mCallbacks.map(function (ele) { return ele(); }).filter(function (ele) { return ele instanceof Promise; });
                        if (!(results.length > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, Promise.all(results)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/, result];
                }
            });
        });
    };
}
exports.Action = Action;
