import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { aspectDict as basicAspectDict } from 'oak-general-business';
import { Feature } from '../types/Feature';
import { FrontContext } from '../FrontContext';
import { AspectProxy } from '../types/AspectProxy';
import { Cache } from './cache';


export class Token extends Feature<BaseEntityDict, typeof basicAspectDict> {
    tokenValue?: string;
    cache: Cache<BaseEntityDict, typeof basicAspectDict>;

    constructor(cache: Cache<BaseEntityDict, typeof basicAspectDict>) {
        super();
        this.cache = cache;        
    }

    getValue() {
        return this.tokenValue;
    }

    async get() {
        if (!this.tokenValue) {
            return null;
        }
        const [token] = await this.cache.get('token',{
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
        });
        return token;
    }

    protected async loginByPassword(mobile: string, password: string) {
        const token = await this.getAspectProxy().loginByPassword({ mobile, password });
        this.tokenValue = token;
    }
}

export type Action = {
    loginByPassword: Token['loginByPassword'];
};
