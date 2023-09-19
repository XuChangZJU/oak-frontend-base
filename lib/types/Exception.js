"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OakSubscriberConnectError = exports.OakEnvInitializedFailure = void 0;
const types_1 = require("oak-domain/lib/types");
class OakEnvInitializedFailure extends types_1.OakException {
    error;
    constructor(err) {
        super('环境初始化失败，请检查授权情况');
        this.error = err;
    }
}
exports.OakEnvInitializedFailure = OakEnvInitializedFailure;
;
class OakSubscriberConnectError extends types_1.OakException {
    constructor(url, path) {
        super(`Subscriber无法连接上socket，请联系技术人员。url「${url}」，path「${path}」`);
    }
}
exports.OakSubscriberConnectError = OakSubscriberConnectError;
