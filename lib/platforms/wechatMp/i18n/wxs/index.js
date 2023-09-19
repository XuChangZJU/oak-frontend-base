"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessageInterpreter = void 0;
const interpreter_1 = require("../interpreter");
const common_1 = require("../common");
function getMessageInterpreter() {
    function evaluate(key, params, locale, translations) {
        const message = (0, common_1.lookUpAST)(key, translations, locale, locale);
        return (0, interpreter_1.interpret)(message, params);
    }
    return function _interpret(key, params, locale, translations) {
        if (arguments.length === 3) {
            const key = arguments[0];
            const locale = arguments[1];
            const translations = arguments[2];
            return evaluate(key, null, locale, translations);
        }
        if (arguments.length === 4) {
            const key = arguments[0];
            const params = arguments[1];
            const locale = arguments[2];
            const translations = arguments[3];
            return evaluate(key, params, locale, translations);
        }
        return '';
    };
}
exports.getMessageInterpreter = getMessageInterpreter;
