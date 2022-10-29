import { Action, Feature } from '../types/Feature';
import { NotificationProps } from '../types/Notification';

export class Notification  extends Feature{
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
