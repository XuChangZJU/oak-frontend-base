"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = void 0;
var tslib_1 = require("tslib");
var fingerprintjs_1 = tslib_1.__importDefault(require("@fingerprintjs/fingerprintjs"));
var lodash_1 = require("oak-domain/lib/utils/lodash");
/**
 * fingerprintJs当中的一些敏感项
 * @returns
 */
function getEnv() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var fp, result, visitorId, components;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fingerprintjs_1.default.load()];
                case 1:
                    fp = _a.sent();
                    return [4 /*yield*/, fp.get()];
                case 2:
                    result = _a.sent();
                    visitorId = result.visitorId, components = result.components;
                    return [2 /*return*/, Object.assign((0, lodash_1.pick)(components, [
                            'platform',
                            'timezone',
                            'vendor',
                            'vendorFlavors'
                        ]), {
                            type: 'web',
                            visitorId: visitorId,
                        })];
            }
        });
    });
}
exports.getEnv = getEnv;
