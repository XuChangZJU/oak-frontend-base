"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = void 0;
const tslib_1 = require("tslib");
const fingerprintjs_1 = tslib_1.__importDefault(require("@fingerprintjs/fingerprintjs"));
const lodash_1 = require("oak-domain/lib/utils/lodash");
/**
 * fingerprintJs当中的一些敏感项
 * @returns
 */
async function getEnv() {
    const fp = await fingerprintjs_1.default.load();
    // 有浏览器没有storage
    const [result /* , localStorageEnabled */] = await Promise.all([fp.get() /* , navigator.storage.persisted() */]);
    const { visitorId, components } = result;
    return Object.assign((0, lodash_1.pick)(components, [
        'platform',
        'timezone',
        'vendor',
        'vendorFlavors'
    ]), {
        type: 'web',
        visitorId,
        // localStorageEnabled,
        language: navigator.language,
    });
}
exports.getEnv = getEnv;
