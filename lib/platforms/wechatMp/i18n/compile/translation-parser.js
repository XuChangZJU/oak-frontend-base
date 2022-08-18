"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTranslations = void 0;
var tslib_1 = require("tslib");
var format_message_parse_1 = tslib_1.__importDefault(require("format-message-parse"));
function parseTranslations(object) {
    var e_1, _a;
    var keys = Object.keys(object);
    try {
        for (var keys_1 = tslib_1.__values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
            var key = keys_1_1.value;
            var val = object[key];
            if (typeof val === 'string') {
                object[key] = (0, format_message_parse_1.default)(val);
            }
            if (typeof val === 'object') {
                object[key] = parseTranslations(val);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (keys_1_1 && !keys_1_1.done && (_a = keys_1.return)) _a.call(keys_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return object;
}
exports.parseTranslations = parseTranslations;
