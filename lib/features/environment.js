"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = void 0;
const Feature_1 = require("../types/Feature");
const env_1 = require("../utils/env/env");
const assert_1 = require("oak-domain/lib/utils/assert");
const Exception_1 = require("../types/Exception");
class Environment extends Feature_1.Feature {
    env;
    loading = false;
    constructor() {
        super();
        this.initialize();
    }
    async initialize() {
        this.loading = true;
        try {
            const env = await (0, env_1.getEnv)();
            this.loading = false;
            this.env = env;
            this.publish();
        }
        catch (err) {
            throw new Exception_1.OakEnvInitializedFailure(err);
        }
    }
    async getEnv() {
        if (this.env) {
            return this.env;
        }
        else {
            (0, assert_1.assert)(this.loading);
            return new Promise((resolve, reject) => {
                const fn = this.subscribe(() => {
                    fn();
                    (0, assert_1.assert)(this.env);
                    resolve(this.env);
                });
            });
        }
    }
}
exports.Environment = Environment;
;
