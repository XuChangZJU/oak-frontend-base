/**
 * Created by Administrator on 2018/3/24.
 */
import i18next, { InitOptions } from 'i18next';
import HttpBackend from 'i18next-http-backend';
import Backend from 'i18next-chained-backend';
import LocalStorageBackend from 'i18next-localstorage-backend'; // primary use cache
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { get, assign } from 'lodash';
import I18nextKeysOnDemand from './keys-ondemand';

/**
 * I18N语言包设计思路：
 * 1）在本地缓存中查找
 * 2）通过xhr请求服务器上的ns文件
 * 3）若服务器的ns版本作了动态更新，在一个key发生miss的时候再请求一次
 * @type {string}
 */
const LOCAL_STORE_PREFIX = 'i18next_res_';
/**
 * 当一个ns下的key发生了miss的处理
 * 当用户本地缓存的ns文件和远端的ns文件不一致时才会发生，此时先获得整个新的ns文件的内容，储存在本地
 * todo 可以做成增量获取，但现在没必要 by Xc
 * @param keys
 * @param language
 * @param namespace
 * @returns {Promise}
 */
async function translationService(
    keys: string[],
    language: string,
    namespace: string
) {
    const url = `${process.env.PUBLIC_URL}/locales/${language}/${namespace}.json`;
  
    let json = {};
    try {
        const response = await fetch(url);
        json = await response.json();
    } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[i18n]:请求${url}失败`);
        }
    }
   
    if (window.localStorage) {
        try {
            window.localStorage.setItem(
                `${LOCAL_STORE_PREFIX}${language}-${namespace}`,
                JSON.stringify(json)
            );
        } catch (e) {
            // f.log('failed to set value for key "' + key + '" to localStorage.');
        }
    }
    const result = {};
    keys.forEach((k: string) => {
        const v = get(json, k);
        if (process.env.NODE_ENV !== 'production' && !v) {
            console.warn(
                v,
                `[i18n]:${namespace}-${k}最新的服务器数据中无此键值`
            );
        }
        if (v) {
            assign(result, { [k]: v });
        }
    });

    return result;
}

export type I18nOptions = {
    version?: string;
    debug?: boolean; //默认 process.env.NODE_ENV !== 'production'
};

function getI18nextInitOptions(options?: I18nOptions) {
    const { version = '1.0.0', debug = false } = options || {};
    return {
        debug: debug,
        fallbackLng: 'zh_CN',
        ns: ['common', 'error'],
        lng: 'zh_CN',
        load: 'currentOnly',
        defaultNS: 'common',

        interpolation: {
            escapeValue: false, // not needed for react!!
        },

        // react i18next special options (optional)
        react: {
            // wait: true,
            bindI18n: 'added languageChanged',
            bindI18nStore: 'added',
            nsMode: 'default',
            useSuspense: true,
        },
        backend: {
            backends: [
                LocalStorageBackend, // primary
                HttpBackend, // fallback
            ],
            backendOptions: [
                {
                    // prefix for stored languages
                    prefix: LOCAL_STORE_PREFIX,
                    // expiration
                    expirationTime:
                        process.env.NODE_ENV !== 'production'
                            ? 120 * 1000
                            : 300 * 24 * 3600 * 1000,
                    defaultVersion: version,
                },
                {
                    // for all available options read the backend's repository readme file
                    loadPath: `${process.env.PUBLIC_URL}/locales/{{lng}}/{{ns}}.json`,
                },
            ],
        },
        returnObjects: true,
        joinArrays: true,
        saveMissing: true,
        // missingKeyHandler: (
        //     lngs: readonly string[],
        //     ns: string,
        //     key: string,
        //     fallbackValue: string,
        //     updateMissing: boolean,
        //     options: any
        // ) => {
        //     console.warn(lngs, ns, key, fallbackValue);
        // },
    };
}

export function getI18next(options?: I18nOptions) {
    const i18nextInitOptions = getI18nextInitOptions(options) as InitOptions;
    i18next
        .use(
            new I18nextKeysOnDemand({
                translationGetter: translationService,
            }) as any
        )
        .use(Backend)
        .use(LanguageDetector)
        .use(initReactI18next) // if not using I18nextProvider
        .init(i18nextInitOptions, (err) => {
            // console.log(err);
        });

    return i18next;
};
