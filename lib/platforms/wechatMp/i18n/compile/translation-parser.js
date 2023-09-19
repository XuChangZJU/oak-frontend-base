"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTranslations = void 0;
const tslib_1 = require("tslib");
const format_message_parse_1 = tslib_1.__importDefault(require("format-message-parse"));
function parseTranslations(object) {
    const keys = Object.keys(object);
    for (const key of keys) {
        const val = object[key];
        if (typeof val === 'string') {
            object[key] = (0, format_message_parse_1.default)(val);
        }
        if (typeof val === 'object') {
            object[key] = parseTranslations(val);
        }
    }
    return object;
}
exports.parseTranslations = parseTranslations;
