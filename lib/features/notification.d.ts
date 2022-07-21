import { EntityDict, Context } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
import { NotificationProps } from '../types/Notification';
export declare class Notification<ED extends EntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature<ED, Cxt, AD> {
    private data?;
    setNotification(data: NotificationProps): void;
    consumeNotification(): NotificationProps | undefined;
}
