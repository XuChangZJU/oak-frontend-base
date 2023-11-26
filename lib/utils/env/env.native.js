"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = void 0;
const react_native_1 = require("react-native");
const react_native_localize_1 = require("react-native-localize");
async function getEnv() {
    const language = (0, react_native_localize_1.getLocales)()[0].languageTag;
    return {
        ...react_native_1.Platform,
        language,
    };
}
exports.getEnv = getEnv;
