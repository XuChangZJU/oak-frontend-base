"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Locales = void 0;
const Feature_1 = require("../types/Feature");
class Locales extends Feature_1.Feature {
    async get(namespace, locale, scene) {
        const { result } = await this.getAspectWrapper().exec('getTranslations', { namespace, locale });
        return {
            translations: result,
        };
    }
}
exports.Locales = Locales;
