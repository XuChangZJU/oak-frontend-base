import { Feature } from "../types/Feature";
import { NativeEnv, WebEnv, WechatMpEnv, BriefEnv } from 'oak-domain/lib/types/Environment';
export declare class Environment extends Feature {
    fullEnv?: WebEnv | WechatMpEnv | NativeEnv;
    briefEnv?: BriefEnv;
    loading: boolean;
    constructor();
    private initialize;
    getEnv(): Promise<WebEnv | WechatMpEnv | NativeEnv>;
    getBriefEnv(): BriefEnv | undefined;
}
