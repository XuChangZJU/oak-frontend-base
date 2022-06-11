import { operate, select } from './crud';
import { amap } from './amap';
import { getTranslations } from './locales';
declare const aspectDict: {
    operate: typeof operate;
    select: typeof select;
    amap: typeof amap;
    getTranslations: typeof getTranslations;
};
export default aspectDict;
