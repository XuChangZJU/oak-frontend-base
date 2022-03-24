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
    getValue() {
        return this.tokenValue;
    }
    async get() {
        if (!this.tokenValue) {
            return null;
        }
        const [token] = await this.cache.get('token', {
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
    async loginByPassword(mobile, password) {
        const token = await this.getAspectProxy().loginByPassword({ mobile, password });
        this.tokenValue = token;
    }
}
exports.Token = Token;
