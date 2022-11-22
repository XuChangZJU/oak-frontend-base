import { Feature } from '../types/Feature';
import { MessageProps } from '../types/Message';


export class Message  extends Feature{
    private data?: MessageProps;

    async setMessage(data: MessageProps) {
        this.data = data;
        this.publish();
    }

    consumeMessage() {
        const data = this.data;
        this.data = undefined;
        return data;
    }
}
