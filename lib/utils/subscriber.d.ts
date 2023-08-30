import { EntityDict, SubDataDef, OpRecord } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
export default class SubScriber<ED extends BaseEntityDict & EntityDict> {
    private getSubscribePointUrl;
    constructor(getSubscribePointUrl: string);
    sub(data: SubDataDef<ED, keyof ED>[], callback: (records: OpRecord<ED>[], ids: string[]) => void): Promise<void>;
    unsub(ids: string[]): Promise<void>;
}
