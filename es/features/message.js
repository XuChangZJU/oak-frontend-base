import { Feature } from '../types/Feature';
export class Message extends Feature {
    data;
    async setMessage(data) {
        this.data = data;
        this.publish();
    }
    consumeMessage() {
        const data = this.data;
        this.data = undefined;
        return data;
    }
}
