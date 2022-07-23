"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpret = void 0;
var EMPTY = '';
function interpret(message, params) {
    if (!message)
        return EMPTY;
    if (typeof message === 'string')
        return message;
    return message
        .reduce(function (acc, cur) {
        return acc.concat([_eval(cur, params)]);
    }, [])
        .join('');
}
exports.interpret = interpret;
function _eval(element, params) {
    params = params || {};
    if (typeof element === 'string') {
        return element;
    }
    if (element[2] && typeof element[2] === 'object') {
        var childExprs = Object.keys(element[2]).reduce(function (acc, key) {
            acc[key] = interpret(element[2][key], params);
            return acc;
        }, {});
        var target = childExprs[params[0]];
        var value = params[element[0]];
        if (typeof value !== 'undefined') {
            return childExprs[value.toString()] || childExprs.other || EMPTY;
        }
        if (target) {
            return target;
        }
        else {
            return childExprs.other || EMPTY;
        }
    }
    // Value interpolation, element should be an array
    if (typeof element === 'object' && element.length > 0) {
        var paramName = element[0];
        var tokens = paramName.split('.');
        return getParams(tokens, params, 0);
    }
    return '';
}
function getParams(tokens, params, i) {
    if (i === void 0) { i = 0; }
    if (!params || !tokens || tokens.length <= 0)
        return '';
    var current = params[tokens[i]];
    if (typeof current === 'string') {
        return current;
    }
    if (typeof current === 'number') {
        return current.toString();
    }
    if (!current) {
        return "{".concat(tokens.join('.'), "}");
    }
    return getParams(tokens, current, ++i);
}
