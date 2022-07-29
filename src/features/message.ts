import { EntityDict, Aspect, Context } from 'oak-domain/lib/types';
import { Action, Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
import { MessageProps } from '../types/Message';

export class Message<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends CommonAspectDict<ED, Cxt>
> extends Feature<ED, Cxt, AD> {
    private data?: MessageProps;

    @Action
    setMessage(data: MessageProps) {
        this.data = data;
    }

    consumeMessage() {
        const data = this.data;
        this.data = undefined;
        return data;
    }
}
