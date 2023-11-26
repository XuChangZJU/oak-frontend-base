import { Feature } from "../types/Feature";
import { NativeEnv, WebEnv, WechatMpEnv } from 'oak-domain/lib/types/Environment';
export declare class Environment extends Feature {
    env?: WebEnv | WechatMpEnv | NativeEnv;
    loading: boolean;
    constructor();
    private initialize;
    getEnv(): Promise<WebEnv | WechatMpEnv | NativeEnv>;
}
