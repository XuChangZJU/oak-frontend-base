import { Feature } from '../types/Feature';
import { NotificationProps } from '../types/Notification';
export declare class Notification extends Feature {
    private data?;
    setNotification(data: NotificationProps): void;
    consumeNotification(): NotificationProps | undefined;
}
