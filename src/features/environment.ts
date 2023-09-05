import { Feature } from "../types/Feature";
import { WebEnv, WechatMpEnv } from 'oak-domain/lib/types/Environment';
import { getEnv } from '../utils/env/env';
import { assert } from 'oak-domain/lib/utils/assert';
import { OakEnvInitializedFailure } from "../types/Exception";

export class Environment extends Feature {
    env?: WebEnv | WechatMpEnv;
    loading = false;

    constructor() {
        super();

        this.initialize();
    }

    private async initialize() {
        this.loading = true;
        try {
            const env = await getEnv();
            this.loading = false;
            this.env = env;
            this.publish();
        }
        catch (err) {
            throw new OakEnvInitializedFailure(err as Error);
        }
    }

    async getEnv(): Promise<WebEnv | WechatMpEnv> {
        if (this.env) {
            return this.env;
        }
        else {
            assert(this.loading);
            return new Promise(
                (resolve, reject) => {
                    const fn = this.subscribe(
                        () => {
                            fn();
                            assert(this.env);
                            resolve(this.env);
                        }
                    )
                }
            );
        }
    }
};
