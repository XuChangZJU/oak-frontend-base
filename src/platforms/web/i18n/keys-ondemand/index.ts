import debounce from 'debounce';
import { InitOptions } from 'i18next';

export interface i18nInitOptions extends InitOptions {
    on(
        event: 'missingKey',
        callback: (
            lngs: string[],
            namespace: string,
            key: string,
            res: string
        ) => void
    ): void;

    /**
     * Adds multiple key/values.
     */
    addResources(lng: string, ns: string, resources: any): void;
    options: InitOptions;
}

export interface TranslationMap {
    [key: string]: string;
}

export type TranslationGetter = (
    keys: string[],
    language: string,
    namespace: string
) => Promise<TranslationMap>;

interface KeyQueue {
    [path: string]: KeysSet;
}
interface KeysSet {
    [key: string]: boolean;
}

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



class I18nextKeysOnDemand {
    type: string;
    options: Options;
    constructor(options: Options) {
        this.type = '3rdParty';
        this.options = { debounceDelay: 100, missingKeyValue: '', ...options };
    }

    init(instance: i18nInitOptions) {
        const missingKeysQueue: KeyQueue = {};
        const options = this.options;

        function requestResources(lng: string, ns: string) {
            const path = `${lng}.${ns}`;
            options
                .translationGetter(Object.keys(missingKeysQueue[path]), lng, ns)
                .then((result) => {
                    missingKeysQueue[path] = {};
                    instance.addResources(lng, ns, result);
                });
        }

        const debouncedRequestResources: { [path: string]: () => void } = {};
        function requestKey(key: string, lng: string, ns: string) {
            const path = `${lng}.${ns}`;
            missingKeysQueue[path] = missingKeysQueue[path] || {};
            missingKeysQueue[path][key] = true;

            debouncedRequestResources[path] =
                debouncedRequestResources[path] ||
                debounce(
                    () => requestResources(lng, ns),
                    options.debounceDelay
                );
            debouncedRequestResources[path]();
        }

        instance.on(
            'missingKey',
            (lngs: string | string[], ns: string, key: string, res: string) => {
                instance.options.parseMissingKeyHandler = () => {
                    return options.missingKeyValue;
                };

                const languages = typeof lngs === 'string' ? [lngs] : lngs;
                languages.map((l) => requestKey(key, l, ns));
            }
        );
    }
}

export default I18nextKeysOnDemand;