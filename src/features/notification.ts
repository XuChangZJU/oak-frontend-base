import { EntityDict, Aspect, Context } from 'oak-domain/lib/types';
import { Action, Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
import { NotificationProps } from '../types/Notification';

export class Notification<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends CommonAspectDict<ED, Cxt>
> extends Feature<ED, Cxt, AD> {
    private data?: NotificationProps;

    @Action
    setNotification(data: NotificationProps) {
        this.data = data;
    }

    consumeNotification() {
        const data = this.data;
        this.data = undefined;
        return data;
    }
}
