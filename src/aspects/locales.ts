import { assign } from "lodash";


export function getTranslations(options: {
    namespace: string | string[];
    locale: string;
}) {
    const { namespace, locale } = options;
    // 表示entity locale表示zh_CN
    let translations = {};

    return {
        common: {
            action: {
                confirm: '确定2',
            },
        },
    };

    // const getTranslations = (ns: string) => {
    //     const entityName = ns.substring(0, 1).toUpperCase() + ns.substring(1);
    //     const entityName2 = ns.toLowerCase();

    //     try {
    //         const data = require(`${entityName}/locales/${locale}.ts`).default;
    //         assign(translations, {
    //             [entityName2]: data,
    //         });
    //     }
    //     catch (err) {
    //         throw err
    //     }
    // };

    // if (namespace instanceof Array) {
    //     namespace.forEach((ns) => {
    //         getTranslations(ns);
    //     })
    // }
    // else {
    //     getTranslations(namespace);
    // }

    // return translations;
}
