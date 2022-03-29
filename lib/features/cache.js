"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const Feature_1 = require("../types/Feature");
const lodash_1 = require("lodash");
class Cache extends Feature_1.Feature {
    action(context, action) {
        const { type, payload } = action;
        if (type === 'refresh') {
            const { entity, selection, params } = payload;
            return this.getAspectProxy().operate({
                entity: entity,
                operation: (0, lodash_1.assign)({}, selection, { action: 'select' }),
                params,
            }, context);
        }
        return context.rowStore.sync(payload, context);
    }
    async get(context, options) {
        const { entity, selection, params } = options;
        const { result } = await context.rowStore.select(entity, selection, context, params);
        return result;
    }
}
exports.Cache = Cache;
