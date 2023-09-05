/**
 * Common runtime logic between js and wxs
 */
function get(object, path, defaultValue) {
    // 判断 object 是否是数组或者对象，否则直接返回默认值 defaultValue
    if (typeof object !== 'object')
        return defaultValue;
    // 沿着路径寻找到对应的值，未找到则返回默认值 defaultValue
    return (_basePath(path).reduce((o, k) => {
        return (o || {})[k];
    }, object) || defaultValue);
}
function _basePath(path) {
    if (Array.isArray(path))
        return path;
    // 若有 '[',']'，则替换成将 '[' 替换成 '.',去掉 ']'
    return path.replace(/\[/g, '.').replace(/\]/g, '').split('.');
}
// 判断key是否存在问号， 存在替换成.
function getKey(key) {
    let key2 = key;
    if (key2 && key2.indexOf(':') !== -1) {
        key2 = key.replace(new RegExp(':', 'ig'), '.');
    }
    return key2;
}
function lookUpASTFallback(translations, fallbackLocale, key) {
    const key2 = getKey(key);
    const fallbackTranslation = translations[fallbackLocale];
    if (!fallbackTranslation) {
        return key;
    }
    let translation = fallbackTranslation[key2];
    if (!translation) {
        translation = get(fallbackTranslation, key2);
    }
    return translation || key;
}
export function lookUpAST(key, translations, locale, fallbackLocale) {
    const key2 = getKey(key);
    const translationsForLocale = translations[locale];
    if (!translationsForLocale) {
        return lookUpASTFallback(translations, fallbackLocale, key);
    }
    let translation = translationsForLocale[key2];
    if (!translation) {
        translation = get(translationsForLocale, key2);
    }
    if (!translation) {
        return lookUpASTFallback(translations, fallbackLocale, key);
    }
    return translation;
}
