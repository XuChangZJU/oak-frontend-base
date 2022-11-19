import { Feature } from '../types/Feature';
import { NotificationProps } from '../types/Notification';

export class Notification  extends Feature{
    private data?: NotificationProps;

    setNotification(data: NotificationProps) {
        this.data = data;
        this.publish();
    }

    consumeNotification() {
        const data = this.data;
        this.data = undefined;
        return data;
    }
}
