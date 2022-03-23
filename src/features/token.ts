import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { aspectDict as basicAspectDict} from 'oak-general-business';
import { Feature } from '../types/Feature';
import { FrontContext } from '../FrontContext';
import { AspectProxy } from '../types/AspectProxy';
import { Cache } from './cache';


export class Token<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>> extends Feature<ED, AD> {
    tokenValue?: string;
    cache: Cache<ED, AD>;

    constructor(cache: Cache<ED, AD>, context: FrontContext<ED>) {
        super(context, {} as any);
        this.cache = cache;
    }
    
    async get() {
        if (!this.tokenValue) {
            return null;
        }
        const [ token ] = await this.cache.get({
            entity: 'token',
            selection: {
                data: {
                    id: 1,
                    userId: 1,
                    user: {
                        id: 1,
                        name: 1,
                        nickname: 1,
                    },
                    playerId: 1,
                    player: {
                        id: 1,
                        name: 1,
                        nickname: 1,
                    },
                },
                filter: {
                    id: this.tokenValue,
                },
            }
        });
        return token;
    }

    protected async loginByPassword(mobile: string, password: string) {
        const token = await this.aspectProxy.loginByPassword({ mobile, password });
        this.tokenValue = token;
    }

    getTokenValue() {
        return this.tokenValue;
    }

    setAspectProxy(aspectProxy: AspectProxy<ED, AD & typeof basicAspectDict>) {
        this.aspectProxy = aspectProxy;
    }
}

export type Action<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>> = {
    loginByPassword: Token<ED, AD>['loginByPassword'];
};
