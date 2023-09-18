"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendRuntimeContext = void 0;
var tslib_1 = require("tslib");
var AsyncRowStore_1 = require("oak-domain/lib/store/AsyncRowStore");
var BackendRuntimeContext = /** @class */ (function (_super) {
    tslib_1.__extends(BackendRuntimeContext, _super);
    function BackendRuntimeContext(store, data, headers) {
        var _this = _super.call(this, store, headers) || this;
        if (data) {
            _this.subscriberId = data.sid;
        }
        return _this;
    }
    BackendRuntimeContext.prototype.getSubscriberId = function () {
        return this.subscriberId;
    };
    BackendRuntimeContext.prototype.initialized = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    return BackendRuntimeContext;
}(AsyncRowStore_1.AsyncContext));
exports.BackendRuntimeContext = BackendRuntimeContext;
