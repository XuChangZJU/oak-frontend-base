import { Action, Feature } from '../types/Feature';
import { MessageProps } from '../types/Message';


export class Message  extends Feature{
    private data?: MessageProps;

    @Action
    async setMessage(data: MessageProps) {
        this.data = data;
    }

    consumeMessage() {
        const data = this.data;
        this.data = undefined;
        return data;
    }
}
