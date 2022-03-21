import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Feature } from '../types/Feature';
import { FrontContext } from '../FrontContext';
export declare class Token<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>> extends Feature<ED, AD> {
    tokenValue?: string;
    get(context: FrontContext<ED, AD>): Promise<void>;
    action(context: FrontContext<ED, AD>, type: string, payload?: any): Promise<void>;
    getTokenValue(): string | undefined;
}
