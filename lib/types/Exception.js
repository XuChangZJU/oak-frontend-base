"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OakSubscriberConnectError = exports.OakEnvInitializedFailure = void 0;
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
;
var OakSubscriberConnectError = /** @class */ (function (_super) {
    tslib_1.__extends(OakSubscriberConnectError, _super);
    function OakSubscriberConnectError(url, path) {
        return _super.call(this, "Subscriber\u65E0\u6CD5\u8FDE\u63A5\u4E0Asocket\uFF0C\u8BF7\u8054\u7CFB\u6280\u672F\u4EBA\u5458\u3002url\u300C".concat(url, "\u300D\uFF0Cpath\u300C").concat(path, "\u300D")) || this;
    }
    return OakSubscriberConnectError;
}(types_1.OakException));
exports.OakSubscriberConnectError = OakSubscriberConnectError;
