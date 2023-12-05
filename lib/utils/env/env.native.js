"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = void 0;
const react_native_1 = require("react-native");
const react_native_localize_1 = require("react-native-localize");
async function getEnv() {
    const language = (0, react_native_localize_1.getLocales)()[0].languageTag;
    const fullEnv = {
        ...react_native_1.Platform,
        language,
    };
    const briefEnv = {
        brand: fullEnv.constants.Brand,
        model: fullEnv.constants.Model,
        system: `${fullEnv.OS}/${fullEnv.constants.Version || fullEnv.constants.osVersion}/${language}`,
    };
    return {
        fullEnv,
        briefEnv,
    };
}
exports.getEnv = getEnv;
