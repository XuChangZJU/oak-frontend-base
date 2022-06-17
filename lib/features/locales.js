"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Locales = void 0;
const Feature_1 = require("../types/Feature");
class Locales extends Feature_1.Feature {
    async get(namespace, locale, scene) {
        const translations = await this.getAspectProxy().getTranslations({ namespace, locale }, scene);
        return {
            translations,
        };
    }
}
exports.Locales = Locales;
