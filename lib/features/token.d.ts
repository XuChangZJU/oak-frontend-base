import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { aspectDict as basicAspectDict } from 'oak-general-business';
import { FrontContext } from '../FrontContext';
import { Feature } from '../types/Feature';
import { Cache } from './cache';
declare type LoginByPassword = {
    type: 'lbp';
    payload: {
        mobile: string;
        password: string;
    };
};
export declare class Token extends Feature<BaseEntityDict, typeof basicAspectDict> {
    tokenValue?: string;
    cache: Cache<BaseEntityDict, typeof basicAspectDict>;
    constructor(cache: Cache<BaseEntityDict, typeof basicAspectDict>);
    get(context: FrontContext<BaseEntityDict>, type: 'value' | 'token'): Promise<string | Partial<{
        id: string;
        $$createAt$$: import("oak-domain/lib/types/DataType").Datetime;
        $$updateAt$$: import("oak-domain/lib/types/DataType").Datetime;
        $$removeAt$$?: import("oak-domain/lib/types/DataType").Datetime | undefined;
        applicationId: string;
        entity: string;
        entityId: string;
        userId?: string | undefined;
        playerId?: string | undefined;
        ableState?: import("oak-domain/lib/actions/action").AbleState | undefined;
        application: import("oak-domain/lib/base-domain/Application/Schema").Schema;
        user?: import("oak-domain/lib/base-domain/User/Schema").Schema | undefined;
        player?: import("oak-domain/lib/base-domain/User/Schema").Schema | undefined;
        mobile?: import("oak-domain/lib/base-domain/Mobile/Schema").Schema | undefined;
    } & {
        $expr?: any;
        $expr1?: any;
        $expr2?: any;
        $expr3?: any;
        $expr4?: any;
        $expr5?: any;
        $expr6?: any;
        $expr7?: any;
        $expr8?: any;
        $expr9?: any;
        $expr10?: any;
        $expr11?: any;
        $expr12?: any;
        $expr13?: any;
        $expr14?: any;
        $expr15?: any;
        $expr16?: any;
        $expr17?: any;
        $expr18?: any;
        $expr19?: any;
        $expr20?: any;
    } & {
        $expr?: any;
        $expr1?: any;
        $expr2?: any;
        $expr3?: any;
        $expr4?: any;
        $expr5?: any;
        $expr6?: any;
        $expr7?: any;
        $expr8?: any;
        $expr9?: any;
        $expr10?: any;
        $expr11?: any;
        $expr12?: any;
        $expr13?: any;
        $expr14?: any;
        $expr15?: any;
        $expr16?: any;
        $expr17?: any;
        $expr18?: any;
        $expr19?: any;
        $expr20?: any;
    }> | undefined>;
    action(context: FrontContext<BaseEntityDict>, action: LoginByPassword): Promise<void>;
}
export {};