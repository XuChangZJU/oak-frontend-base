"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const Feature_1 = require("../types/Feature");
class Cache extends Feature_1.Feature {
    async get(entity, selection, params) {
        const { result } = await this.getContext().rowStore.select(entity, selection, this.getContext(), params);
        return result;
    }
    async refresh(entity, selection, params) {
        this.getAspectProxy().select({ entity: entity, selection, params });
    }
    async sync(opRecords) {
        await this.getContext().rowStore.sync(opRecords, this.getContext());
    }
}
exports.Cache = Cache;
