let MissCallback = () => undefined;
export function registerMissCallback(callback) {
    MissCallback = callback;
}
function get(object, path) {
    // 沿着路径寻找到对应的值，未找到则返回默认值 defaultValue
    return (_basePath(path).reduce((o, k) => {
        return (o || {})[k];
    }, object));
}
function _basePath(path) {
    if (Array.isArray(path))
        return path;
    // 若有 '[',']'，则替换成将 '[' 替换成 '.',去掉 ']'
    return path.replace(/\[/g, '.').replace(/\]/g, '').replace(/:/g, '.').split('.');
}
export function t(key, locales, lng, fallbackLng, params) {
    const { [lng]: lngLocales } = locales;
    const lngValue = lngLocales && get(lngLocales, key);
    if (lngValue) {
    }
    return '';
}
