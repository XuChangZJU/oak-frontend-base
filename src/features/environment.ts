import { Feature } from "../types/Feature";
import { NativeEnv, WebEnv, WechatMpEnv, BriefEnv } from 'oak-domain/lib/types/Environment';
import { getEnv } from '../utils/env/env';
import { assert } from 'oak-domain/lib/utils/assert';
import { OakEnvInitializedFailure } from "../types/Exception";

export class Environment extends Feature {
    fullEnv?: WebEnv | WechatMpEnv | NativeEnv;
    briefEnv?: BriefEnv;
    loading = false;

    constructor() {
        super();

        this.initialize();
    }

    private async initialize() {
        this.loading = true;
        try {
            const { fullEnv, briefEnv } = await getEnv();
            this.loading = false;
            this.fullEnv = fullEnv;
            this.briefEnv = briefEnv;
            this.publish();
        }
        catch (err) {
            throw new OakEnvInitializedFailure(err as Error);
        }
    }

    async getEnv(): Promise<WebEnv | WechatMpEnv | NativeEnv> {
        if (this.fullEnv) {
            return this.fullEnv;
        }
        else {
            assert(this.loading);
            return new Promise(
                (resolve, reject) => {
                    const fn = this.subscribe(
                        () => {
                            fn();
                            assert(this.fullEnv);
                            resolve(this.fullEnv);
                        }
                    )
                }
            );
        }
    }

    getBriefEnv() {
        return this.briefEnv;
    }
};
