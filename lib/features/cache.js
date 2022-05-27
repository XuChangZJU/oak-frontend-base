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
        const cacheStore = new CacheStore_1.CacheStore(storageSchema, (scene) => createContext(this.cacheStore, scene));
        if (checkers) {
            checkers.forEach((checker) => cacheStore.registerChecker(checker));
        }
        super();
        this.cacheStore = cacheStore;
        this.createContext = createContext;
        this.syncEventsCallbacks = [];
    }
    refresh(entity, selection, scene, params) {
        return this.getAspectProxy().select({
            entity: entity,
            selection,
            params,
        }, scene);
    }
    async sync(records) {
        const context = this.createContext(this.cacheStore, 'sync');
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
    /**
     * 前端缓存做operation只可能是测试权限，必然回滚
     * @param entity
     * @param operation
     * @param scene
     * @param commit
     * @param params
     * @returns
     */
    async operate(entity, operation, scene, params) {
        const context = this.createContext(this.cacheStore, scene);
        let result;
        await context.begin();
        try {
            result = await this.cacheStore.operate(entity, operation, context, params);
            await context.rollback();
        }
        catch (err) {
            await context.rollback();
            throw err;
        }
        return result;
    }
    async get(entity, selection, scene, params) {
        const context = this.createContext(this.cacheStore, scene);
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
    registerCheckers(checkers) {
        checkers.forEach((checker) => this.cacheStore.registerChecker(checker));
    }
}
__decorate([
    Feature_1.Action
], Cache.prototype, "refresh", null);
__decorate([
    Feature_1.Action
], Cache.prototype, "sync", null);
exports.Cache = Cache;
