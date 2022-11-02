import { Feature } from '../types/Feature';
import { MessageProps } from '../types/Message';
export declare class Message extends Feature {
    private data?;
    setMessage(data: MessageProps): Promise<void>;
    consumeMessage(): MessageProps | undefined;
}
