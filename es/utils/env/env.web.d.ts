import { WebEnv, BriefEnv } from 'oak-domain/lib/types/Environment';
/**
 * fingerprintJs当中的一些敏感项
 * @returns
 */
export declare function getEnv(): Promise<{
    fullEnv: WebEnv;
    briefEnv: BriefEnv;
}>;
