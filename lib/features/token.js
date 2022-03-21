"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
const Feature_1 = require("../types/Feature");
class Token extends Feature_1.Feature {
    tokenValue;
    async get(context) {
        throw new Error('Method not implemented.');
    }
    async action(context, type, payload) {
        throw new Error('Method not implemented.');
    }
    getTokenValue() {
        return this.tokenValue;
    }
}
exports.Token = Token;
