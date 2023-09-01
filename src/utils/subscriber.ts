import {
    Aspect,
    AspectWrapper,
    Checker,
    StorageSchema,
    Connector,
    EntityDict,
    SubDataDef,
    OpRecord,
} from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';

export default class SubScriber<ED extends BaseEntityDict  & EntityDict>{
    private getSubscribePointUrl: string;
    constructor(getSubscribePointUrl: string) {
        this.getSubscribePointUrl = getSubscribePointUrl;
    }

    async sub(data: SubDataDef<ED, keyof ED>[], callback: (records: OpRecord<ED>[], ids: string[]) => void) {
    }

    async unsub(ids: string[]) {

    }
}