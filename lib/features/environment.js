"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = void 0;
var tslib_1 = require("tslib");
var Feature_1 = require("../types/Feature");
var env_1 = require("../utils/env/env");
var assert_1 = tslib_1.__importDefault(require("assert"));
var Exception_1 = require("../types/Exception");
var Environment = /** @class */ (function (_super) {
    tslib_1.__extends(Environment, _super);
    function Environment() {
        var _this = _super.call(this) || this;
        _this.loading = false;
        _this.initialize();
        return _this;
    }
    Environment.prototype.initialize = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var env, err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.loading = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, env_1.getEnv)()];
                    case 2:
                        env = _a.sent();
                        this.loading = false;
                        this.env = env;
                        this.publish();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        throw new Exception_1.OakEnvInitializedFailure(err_1);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Environment.prototype.getEnv = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                if (this.env) {
                    return [2 /*return*/, this.env];
                }
                else {
                    (0, assert_1.default)(this.loading);
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var fn = _this.subscribe(function () {
                                fn();
                                (0, assert_1.default)(_this.env);
                                resolve(_this.env);
                            });
                        })];
                }
                return [2 /*return*/];
            });
        });
    };
    return Environment;
}(Feature_1.Feature));
exports.Environment = Environment;
;
