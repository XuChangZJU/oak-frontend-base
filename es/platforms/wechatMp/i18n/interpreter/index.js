const EMPTY = '';
export function interpret(message, params) {
    if (!message)
        return EMPTY;
    if (typeof message === 'string')
        return message;
    return message
        .reduce((acc, cur) => {
        return acc.concat([_eval(cur, params)]);
    }, [])
        .join('');
}
function _eval(element, params) {
    params = params || {};
    if (typeof element === 'string') {
        return element;
    }
    if (element[2] && typeof element[2] === 'object') {
        const childExprs = Object.keys(element[2]).reduce((acc, key) => {
            acc[key] = interpret(element[2][key], params);
            return acc;
        }, {});
        const target = childExprs[params[0]];
        const value = params[element[0]];
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
        const paramName = element[0];
        const tokens = paramName.split('.');
        return getParams(tokens, params, 0);
    }
    return '';
}
function getParams(tokens, params, i = 0) {
    if (!params || !tokens || tokens.length <= 0)
        return '';
    const current = params[tokens[i]];
    if (typeof current === 'string') {
        return current;
    }
    if (typeof current === 'number') {
        return current.toString();
    }
    if (!current) {
        return `{${tokens.join('.')}}`;
    }
    return getParams(tokens, current, ++i);
}
