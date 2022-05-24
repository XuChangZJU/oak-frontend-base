import { operate, select } from './crud';
import { amap } from './amap';
declare const aspectDict: {
    operate: typeof operate;
    select: typeof select;
    amap: typeof amap;
};
export default aspectDict;
