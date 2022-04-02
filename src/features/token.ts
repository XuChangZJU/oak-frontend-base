import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { aspectDict as basicAspectDict } from 'oak-general-business';
import { FrontContext } from '../FrontContext';
import { Action, Feature } from '../types/Feature';
import { Cache } from './cache';

type LoginByPassword = {
    type: 'lbp';
    payload: {
        mobile: string;
        password: string;
    };
};

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

    async getToken() {        
        const [token] = await this.cache.get({
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
        }});
        return token;
    }

    /* async get(type: 'value' | 'token') {
        if (type === 'value') {
            return this.tokenValue;
        }
        if (!this.tokenValue) {
            return undefined;
        }
        const [token] = await this.cache.get({
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
        }});
        return token;
    } */

    @Action
    async loginByPassword(mobile: string, password: string) {
        this.tokenValue = await this.getAspectProxy().loginByPassword({ mobile, password });
        return;
    }
}
