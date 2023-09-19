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
    return (path.split('.').reduce((o, k) => {
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
const PlaceHolder = /(?:\{\{|%\{)(.*?)(?:\}\}?)/gm;
function interpolate(message, options) {
    if (typeof message === 'string') {
        // 实测下这个正则在小程序wxs环境中过不去，原因未知  by Xc
        const matches = message.match(PlaceHolder);
        if (!matches) {
            return message;
        }
        while (matches.length) {
            let value;
            const placeholder = matches.shift();
            const name = placeholder.replace(PlaceHolder, "$1");
            if (isSet(options[name])) {
                value = options[name].toString().replace(/\$/gm, "_#$#_");
            }
            else if (options.hasOwnProperty(name)) {
                value = '';
            }
            else {
                value = `!missing placeholder ${name}`;
            }
            const regex = new RegExp(placeholder.replace(/\{/gm, "\\{").replace(/\}/gm, "\\}"));
            message = message.replace(regex, value);
        }
        return message.replace(/_#\$#_/g, "$");
    }
    else if (typeof message === 'object' && isSet(options.count)) {
        // 复数形式
        const pluralization = _getPlural(options.count);
        const message2 = message[pluralization];
        return interpolate(message2, options);
    }
    else {
        return `!unrecoganized locales: ${JSON.stringify(message)}`;
    }
}
function constructFullKey(key, namespace, moduleName) {
    let key2 = key;
    if (key.indexOf('::') > 0) {
        // 公共模块
        key2 = `${moduleName}-l-${key}`.replace('::', '.');
    }
    else if (key.indexOf(':') > 0) {
        // entity
        key2 = key.replace(':', '.');
    }
    else {
        // 自身模块
        key2 = `${namespace}.${key}`;
    }
    return key2;
}
let Instance = undefined;
function t(key, p1, p2, p3, p4, p5, p6) {
    let fullKey = '';
    let hasLocale = false;
    if (arguments.length === 7) {
        // key, params, oakLocales, oakLng, oakDefaultLng, namespace, module
        const params = p1, locales = p2, lng = p3, defaultLng = p4, namespace = p5, moduleName = p6;
        if (locales && lng) {
            hasLocale = true;
            fullKey = constructFullKey(key, namespace, moduleName);
            const { [lng]: lngLocales } = locales;
            const lngTrans = lngLocales && get(lngLocales, fullKey);
            if (lngTrans) {
                return interpolate(lngTrans, params);
            }
            if (defaultLng) {
                const { [defaultLng]: dftLngLocales } = locales;
                const dftLngTrans = dftLngLocales && get(dftLngLocales, fullKey);
                if (dftLngTrans) {
                    return interpolate(dftLngTrans, params);
                }
            }
        }
    }
    else if (arguments.length === 6) {
        const locales = p1, lng = p2, defaultLng = p3, namespace = p4, moduleName = p5;
        if (locales && lng) {
            hasLocale = true;
            fullKey = constructFullKey(key, namespace, moduleName);
            const { [lng]: lngLocales } = locales;
            const lngTrans = lngLocales && get(lngLocales, fullKey);
            if (lngTrans) {
                return lngTrans;
            }
            if (defaultLng) {
                const { [defaultLng]: dftLngLocales } = locales;
                const dftLngTrans = dftLngLocales && get(dftLngLocales, fullKey);
                if (dftLngTrans) {
                    return dftLngTrans;
                }
            }
        }
    }
    // 到这里说明miss了，通知AppService层，并返回value
    if (hasLocale && Instance) {
        // todo 
        Instance.callMethod('loadMissedLocales', fullKey);
    }
    return fullKey.split('.').pop();
}
exports.t = t;
function propObserver(locales, oldValue, instance) {
    Instance = instance;
}
