import { NativeEnv, BriefEnv } from 'oak-domain/lib/types/Environment';
export declare function getEnv(): Promise<{
    fullEnv: NativeEnv;
    briefEnv: BriefEnv;
}>;
