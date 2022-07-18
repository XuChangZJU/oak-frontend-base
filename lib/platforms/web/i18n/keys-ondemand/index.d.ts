import { InitOptions } from 'i18next';
export interface i18nInitOptions extends InitOptions {
    on(event: 'missingKey', callback: (lngs: string[], namespace: string, key: string, res: string) => void): void;
    /**
     * Adds multiple key/values.
     */
    addResources(lng: string, ns: string, resources: any): void;
    options: InitOptions;
}
export interface TranslationMap {
    [key: string]: string;
}
export declare type TranslationGetter = (keys: string[], language: string, namespace: string) => Promise<TranslationMap>;
export interface Options {
    /**
     * The resource key translator
     *
     * @type {TranslationGetter}
     * @memberof Options
     */
    translationGetter: TranslationGetter;
    /**
     * Value to return for missing keys (default: empty string)
     *
     * @type {string}
     * @memberof Options
     */
    missingKeyValue?: string;
    /**
     * Delay in ms used to debounce the translation requests (default: 100ms)
     *
     * @type {number}
     * @memberof Options
     */
    debounceDelay?: number;
}
declare class I18nextKeysOnDemand {
    type: string;
    options: Options;
    constructor(options: Options);
    init(instance: i18nInitOptions): void;
}
export default I18nextKeysOnDemand;
