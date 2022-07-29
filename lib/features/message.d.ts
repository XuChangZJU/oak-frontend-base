import { EntityDict, Context } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
import { MessageProps } from '../types/Message';
export declare class Message<ED extends EntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature<ED, Cxt, AD> {
    private data?;
    setMessage(data: MessageProps): void;
    consumeMessage(): MessageProps | undefined;
}
