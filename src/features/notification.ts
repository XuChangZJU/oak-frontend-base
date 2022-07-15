import { EntityDict, Aspect, Context } from 'oak-domain/lib/types';
import { Action, Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
import { NotificationData } from '../types/Notification';

export class Notification<ED extends EntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature<ED, Cxt, AD> {
    private data?: NotificationData;
    
    @Action
    setNotification(data: NotificationData) {
        this.data = data;
    }

    consumeNotification() {
        const data = this.data;
        this.data = undefined;
        return data;
    }
}
