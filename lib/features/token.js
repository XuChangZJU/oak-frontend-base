"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
            }
        });
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
    async loginByPassword(mobile, password) {
        this.tokenValue = await this.getAspectProxy().loginByPassword({ mobile, password });
        return;
    }
}
__decorate([
    Feature_1.Action
], Token.prototype, "loginByPassword", null);
exports.Token = Token;
