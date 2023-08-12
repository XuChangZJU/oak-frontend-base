let MissCallback: (key: string) => void = () => undefined;

export function registerMissCallback(callback: (key: string) => void) {
    MissCallback = callback;
}

// todo 实现i18n.t的逻辑，这段代码将被编译到wxs中供小程序使用。当发生miss时，调用MissCallback函数
export function t(key: string, locales: Record<string, Record<string, any>>, lng: string, fallbackLng?: string, params?: object): string {
    throw new Error('not implemented yet');
}
