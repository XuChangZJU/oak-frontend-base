import { operate, select } from './crud';
declare const aspectDict: {
    operate: typeof operate;
    select: typeof select;
};
export default aspectDict;
