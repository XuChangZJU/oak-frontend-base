let MissCallback: (key: string) => void = () => undefined;

export function registerMissCallback(callback: (key: string) => void) {
    MissCallback = callback;
}

function get(object: Record<string, Record<string, any>>, path: string): string | undefined {
    // 沿着路径寻找到对应的值，未找到则返回默认值 defaultValue
    return (
        _basePath(path).reduce((o: any, k: string) => {
            return (o || {})[k];
        }, object)
    );
}

function _basePath(path: any): string[] {
    if (Array.isArray(path)) return path;
    // 若有 '[',']'，则替换成将 '[' 替换成 '.',去掉 ']'
    return path.replace(/\[/g, '.').replace(/\]/g, '').replace(/:/g, '.').split('.');
}


export function t(key: string, locales: Record<string, Record<string, any>>, lng: string, fallbackLng?: string, params?: object): string {
    const { [lng]: lngLocales } = locales;
    const lngValue = lngLocales && get(lngLocales, key);
    if (lngValue) {

    }
    return '';
}
