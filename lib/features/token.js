"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
const Feature_1 = require("../types/Feature");
class Token extends Feature_1.Feature {
    tokenValue;
    cache;
    constructor(cache) {
        super();
        this.cache = cache;
    }
    async get(context, type) {
        if (type === 'value') {
            return this.tokenValue;
        }
        if (!this.tokenValue) {
            return undefined;
        }
        const [token] = await this.cache.get(context, {
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
    async action(context, action) {
        const { type, payload } = action;
        if (type === 'lbp') {
            this.tokenValue = await this.getAspectProxy().loginByPassword(payload, context);
            return;
        }
        throw new Error('method not implemented');
    }
}
exports.Token = Token;
