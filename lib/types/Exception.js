"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OakEnvInitializedFailure = void 0;
var tslib_1 = require("tslib");
var types_1 = require("oak-domain/lib/types");
var OakEnvInitializedFailure = /** @class */ (function (_super) {
    tslib_1.__extends(OakEnvInitializedFailure, _super);
    function OakEnvInitializedFailure(err) {
        var _this = _super.call(this, '环境初始化失败，请检查授权情况') || this;
        _this.error = err;
        return _this;
    }
    return OakEnvInitializedFailure;
}(types_1.OakException));
exports.OakEnvInitializedFailure = OakEnvInitializedFailure;
