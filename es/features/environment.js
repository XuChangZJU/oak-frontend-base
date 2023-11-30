import { Feature } from "../types/Feature";
import { getEnv } from '../utils/env/env';
import { assert } from 'oak-domain/lib/utils/assert';
import { OakEnvInitializedFailure } from "../types/Exception";
export class Environment extends Feature {
    fullEnv;
    briefEnv;
    loading = false;
    constructor() {
        super();
        this.initialize();
    }
    async initialize() {
        this.loading = true;
        try {
            const { fullEnv, briefEnv } = await getEnv();
            this.loading = false;
            this.fullEnv = fullEnv;
            this.briefEnv = briefEnv;
            this.publish();
        }
        catch (err) {
            throw new OakEnvInitializedFailure(err);
        }
    }
    async getEnv() {
        if (this.fullEnv) {
            return this.fullEnv;
        }
        else {
            assert(this.loading);
            return new Promise((resolve, reject) => {
                const fn = this.subscribe(() => {
                    fn();
                    assert(this.fullEnv);
                    resolve(this.fullEnv);
                });
            });
        }
    }
    getBriefEnv() {
        return this.briefEnv;
    }
}
;
