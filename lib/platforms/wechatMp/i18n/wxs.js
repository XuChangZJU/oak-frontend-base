"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.t = void 0;
/**
 * 在wxs环境下实现部分i18n-js内的逻辑
 * 参见i18n-js/src/i18n.ts中的translate逻辑
 *
 * 这里为了能在小程序的wxs环境中运行，部分代码写的很奇怪
 * 还需要在编译时将正则统一编译成小程序的 getRegExp 语法
 */
function isSet(value) {
    return value !== undefined && value !== null;
}
function get(object, path) {
    // 沿着路径寻找到对应的值，未找到则返回默认值 defaultValue
    return (path.split('.').reduce(function (o, k) {
        return (o || {})[k];
    }, object));
}
function _getPlural(count) {
    switch (count) {
        case 0: {
            return 'zero';
        }
        case 1: {
            return 'one';
        }
        default: {
            return 'other';
        }
    }
}
var PlaceHolder = /(?:\{\{|%\{)(.*?)(?:\}\}?)/gm;
function interpolate(message, options) {
    if (typeof message === 'string') {
        var matches = message.match(PlaceHolder);
        if (!matches) {
            return message;
        }
        while (matches.length) {
            var value = void 0;
            var placeholder = matches.shift();
            var name_1 = placeholder.replace(PlaceHolder, "$1");
            if (isSet(options[name_1])) {
                value = options[name_1].toString().replace(/\$/gm, "_#$#_");
            }
            else if (options.hasOwnProperty(name_1)) {
                value = '';
            }
            else {
                value = "!missing placeholder ".concat(name_1);
            }
            var regex = new RegExp(placeholder.replace(/\{/gm, "\\{").replace(/\}/gm, "\\}"));
            message = message.replace(regex, value);
        }
        return message.replace(/_#\$#_/g, "$");
    }
    else if (typeof message === 'object' && isSet(options.count)) {
        // 复数形式
        var pluralization = _getPlural(options.count);
        var message2 = message[pluralization];
        return interpolate(message2, options);
    }
    else {
        return "!unrecoganized locales: ".concat(JSON.stringify(message));
    }
}
function constructFullKey(key, namespace, moduleName) {
    var key2 = key;
    if (key.indexOf('::') > 0) {
        // 公共模块
        key2 = "".concat(moduleName, "-l-").concat(key).replace('::', '.');
    }
    else if (key.indexOf(':') > 0) {
        // entity
        key2 = key.replace(':', '.');
    }
    else {
        // 自身模块
        key2 = "".concat(namespace, ".").concat(key);
    }
    return key2;
}
function t(key, p1, p2, p3, p4, p5, p6) {
    var fullKey = '';
    var hasLocale = false;
    if (arguments.length === 7) {
        // key, params, oakLocales, oakLng, oakDefaultLng, namespace, module
        var params = p1, locales = p2, lng = p3, defaultLng = p4, namespace = p5, moduleName = p6;
        if (locales && lng) {
            hasLocale = true;
            fullKey = constructFullKey(key, namespace, moduleName);
            var _a = locales, _b = lng, lngLocales = _a[_b];
            var lngTrans = lngLocales && get(lngLocales, fullKey);
            if (lngTrans) {
                return interpolate(lngTrans, params);
            }
            if (defaultLng) {
                var _c = locales, _d = defaultLng, dftLngLocales = _c[_d];
                var dftLngTrans = dftLngLocales && get(dftLngLocales, fullKey);
                if (dftLngTrans) {
                    return interpolate(dftLngTrans, params);
                }
            }
        }
    }
    else if (arguments.length === 6) {
        var locales = p1, lng = p2, defaultLng = p3, namespace = p4, moduleName = p5;
        if (locales && lng) {
            hasLocale = true;
            fullKey = constructFullKey(key, namespace, moduleName);
            var _e = locales, _f = lng, lngLocales = _e[_f];
            var lngTrans = lngLocales && get(lngLocales, fullKey);
            if (lngTrans) {
                return lngTrans;
            }
            if (defaultLng) {
                var _g = locales, _h = defaultLng, dftLngLocales = _g[_h];
                var dftLngTrans = dftLngLocales && get(dftLngLocales, fullKey);
                if (dftLngTrans) {
                    return dftLngTrans;
                }
            }
        }
    }
    // 到这里说明miss了，通知AppService层，并返回value
    if (hasLocale) {
        // todo 
    }
    return fullKey.split('.').pop();
}
exports.t = t;
