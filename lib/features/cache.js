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
const lodash_1 = require("oak-domain/lib/utils/lodash");
class Cache extends Feature_1.Feature {
    cacheStore;
    context;
    syncEventsCallbacks;
    constructor(aspectWrapper, context, cacheStore) {
        super(aspectWrapper);
        this.cacheStore = cacheStore;
        this.context = context;
        this.syncEventsCallbacks = [];
        // 在这里把wrapper的返回opRecords截取到并同步到cache中
        const { exec } = aspectWrapper;
        aspectWrapper.exec = async (name, params) => {
            const { result, opRecords } = await exec(name, params);
            await this.sync(opRecords);
            return {
                result,
                opRecords,
            };
        };
    }
    async refresh(entity, selection, params) {
        const { result } = await this.getAspectWrapper().exec('select', {
            entity,
            selection,
            params,
        });
        return result;
    }
    async sync(records) {
        await this.cacheStore.sync(records, this.context);
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
    async operate(entity, operation, params) {
        let result;
        await this.context.begin();
        try {
            result = await this.cacheStore.operate(entity, operation, this.context, params);
            await this.context.rollback();
        }
        catch (err) {
            await this.context.rollback();
            throw err;
        }
        return result;
    }
    async get(entity, selection, params) {
        const { result } = await this.cacheStore.select(entity, selection, this.context, params);
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
exports.Cache = Cache;
