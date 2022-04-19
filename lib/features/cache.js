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
const CacheStore_1 = require("../cacheStore/CacheStore");
class Cache extends Feature_1.Feature {
    cacheStore;
    createContext;
    syncEventsCallbacks;
    constructor(storageSchema, createContext, checkers) {
        const cacheStore = new CacheStore_1.CacheStore(storageSchema);
        if (checkers) {
            checkers.forEach((checker) => cacheStore.registerChecker(checker));
        }
        super();
        this.cacheStore = cacheStore;
        this.createContext = createContext;
        this.syncEventsCallbacks = [];
    }
    refresh(entity, selection, params) {
        return this.getAspectProxy().operate({
            entity: entity,
            operation: (0, lodash_1.assign)({}, selection, { action: 'select' }),
            params,
        });
    }
    async sync(records) {
        const context = this.createContext(this.cacheStore);
        try {
            await this.cacheStore.sync(records, context);
        }
        catch (err) {
            await context.rollback();
            throw err;
        }
        await context.commit();
        // 唤起同步注册的回调
        const result = this.syncEventsCallbacks.map(ele => ele(records));
        await Promise.all(result);
    }
    async operate(entity, operation, commit = true, params) {
        const context = this.createContext(this.cacheStore);
        let result;
        try {
            result = await this.cacheStore.operate(entity, operation, context, params);
            if (commit) {
                await context.commit();
            }
            else {
                await context.rollback();
            }
        }
        catch (err) {
            await context.rollback();
            throw err;
        }
        return result;
    }
    async get(options) {
        const { entity, selection, params } = options;
        const context = this.createContext(this.cacheStore);
        const { result } = await this.cacheStore.select(entity, selection, context, params);
        return result;
    }
    judgeRelation(entity, attr) {
        return this.cacheStore.judgeRelation(entity, attr);
    }
    bindOnSync(callback) {
        this.syncEventsCallbacks.push(callback);
    }
    unbindOnSync(callback) {
        (0, lodash_1.pull)(this.syncEventsCallbacks, callback);
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
