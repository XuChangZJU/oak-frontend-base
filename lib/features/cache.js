"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const Feature_1 = require("../types/Feature");
const lodash_1 = require("lodash");
class Cache extends Feature_1.Feature {
    async get(entity, selection, params) {
        const { result } = await this.getContext().rowStore.select(entity, selection, this.getContext(), params);
        return result;
    }
    async refresh(entity, selection, params) {
        return this.getAspectProxy().operate({ entity: entity, operation: (0, lodash_1.assign)({}, selection, { action: 'select' }), params });
    }
    async sync(opRecords) {
        await this.getContext().rowStore.sync(opRecords, this.getContext());
    }
}
exports.Cache = Cache;
