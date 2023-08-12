import { Feature } from "../types/Feature";
import { WebEnv, WechatMpEnv } from 'oak-domain/lib/types/Environment';
export declare class Environment extends Feature {
    env?: WebEnv | WechatMpEnv;
    constructor();
    initialize(): Promise<void>;
}
