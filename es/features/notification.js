import { Feature } from '../types/Feature';
export class Notification extends Feature {
    data;
    setNotification(data) {
        this.data = data;
        this.publish();
    }
    consumeNotification() {
        const data = this.data;
        this.data = undefined;
        return data;
    }
}
