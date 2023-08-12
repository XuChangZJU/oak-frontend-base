import { Feature } from "../types/Feature";
import { WebEnv, WechatMpEnv } from 'oak-domain/lib/types/Environment';
import { getEnv } from '../utils/env/env';

export class Environment extends Feature {
    env?: WebEnv | WechatMpEnv;

    constructor() {
        super();

        this.initialize();
    }

    async initialize() {
        const env = await getEnv();
        this.env = env;
        this.publish();
    }
};
