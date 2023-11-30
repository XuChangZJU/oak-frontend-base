import { WechatMpEnv, BriefEnv } from 'oak-domain/lib/types/Environment';
export declare function getEnv(): Promise<{
    fullEnv: WechatMpEnv;
    briefEnv: BriefEnv;
}>;
