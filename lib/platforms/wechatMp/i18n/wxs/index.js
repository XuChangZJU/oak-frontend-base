"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessageInterpreter = void 0;
var interpreter_1 = require("../interpreter");
var common_1 = require("../common");
function getMessageInterpreter() {
    function evaluate(key, params, locale, translations) {
        var message = (0, common_1.lookUpAST)(key, translations, locale, locale);
        return (0, interpreter_1.interpret)(message, params);
    }
    return function _interpret(key, params, locale, translations) {
        if (arguments.length === 3) {
            var key_1 = arguments[0];
            var locale_1 = arguments[1];
            var translations_1 = arguments[2];
            return evaluate(key_1, null, locale_1, translations_1);
        }
        if (arguments.length === 4) {
            var key_2 = arguments[0];
            var params_1 = arguments[1];
            var locale_2 = arguments[2];
            var translations_2 = arguments[3];
            return evaluate(key_2, params_1, locale_2, translations_2);
        }
        return '';
    };
}
exports.getMessageInterpreter = getMessageInterpreter;
