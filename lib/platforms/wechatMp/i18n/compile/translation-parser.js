"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTranslations = void 0;
const format_message_parse_1 = __importDefault(require("format-message-parse"));
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
