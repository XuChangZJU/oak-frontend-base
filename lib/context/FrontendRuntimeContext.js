"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontendRuntimeContext = void 0;
var tslib_1 = require("tslib");
var SyncRowStore_1 = require("oak-domain/lib/store/SyncRowStore");
var FrontendRuntimeContext = /** @class */ (function (_super) {
    tslib_1.__extends(FrontendRuntimeContext, _super);
    function FrontendRuntimeContext(store, features) {
        var _this = _super.call(this, store) || this;
        _this.subscriber = features.subscriber;
        return _this;
    }
    FrontendRuntimeContext.prototype.getSerializedData = function () {
        var sid = this.subscriber.getSubscriberId();
        return {
            sid: sid,
        };
    };
    return FrontendRuntimeContext;
}(SyncRowStore_1.SyncContext));
exports.FrontendRuntimeContext = FrontendRuntimeContext;
