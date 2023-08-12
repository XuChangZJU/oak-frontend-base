"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = void 0;
var tslib_1 = require("tslib");
var Feature_1 = require("../types/Feature");
var env_1 = require("../utils/env/env");
var Environment = /** @class */ (function (_super) {
    tslib_1.__extends(Environment, _super);
    function Environment() {
        var _this = _super.call(this) || this;
        _this.initialize();
        return _this;
    }
    Environment.prototype.initialize = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var env;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, env_1.getEnv)()];
                    case 1:
                        env = _a.sent();
                        this.env = env;
                        this.publish();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Environment;
}(Feature_1.Feature));
exports.Environment = Environment;
;
