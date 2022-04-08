"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const Feature_1 = require("../types/Feature");
const lodash_1 = require("lodash");
class Cache extends Feature_1.Feature {
    refresh(entity, selection, params) {
        return this.getAspectProxy().operate({
            entity: entity,
            operation: (0, lodash_1.assign)({}, selection, { action: 'select' }),
            params,
        });
    }
    sync(records) {
        const context = this.getContext();
        return context.rowStore.sync(records, context);
    }
    operate(entity, operation, params) {
        const context = this.getContext();
        return context.rowStore.operate(entity, operation, context, params);
    }
    async get(options) {
        const { entity, selection, params } = options;
        const context = this.getContext();
        const { result } = await context.rowStore.select(entity, selection, context, params);
        return result;
    }
}
__decorate([
    Feature_1.Action
], Cache.prototype, "refresh", null);
__decorate([
    Feature_1.Action
], Cache.prototype, "sync", null);
__decorate([
    Feature_1.Action
], Cache.prototype, "operate", null);
exports.Cache = Cache;
