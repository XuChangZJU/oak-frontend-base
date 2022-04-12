import { DeduceSelection, EntityDict, OperateParams, OpRecord } from 'oak-domain/lib/types/Entity';
import { Aspect, Checker, checkers as generalCheckers } from 'oak-general-business';
import { Action, Feature } from '../types/Feature';
import { assign } from 'lodash';
import { CacheContext } from '../cacheStore/context';
import { BaseEntityDict } from 'oak-general-business/lib/base-ed/EntityDict';
import { CacheStore } from '../cacheStore/CacheStore';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Schema as Token } from 'oak-general-business/lib/base-ed/Token/Schema';
import { Schema as Application } from 'oak-general-business/lib/base-ed/Application/Schema';

export class Cache<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>> extends Feature<ED, AD> {
    cacheStore: CacheStore<ED>;
    applicationId: string;
    tokenValue?: string;
    token?: Pick<Token, 'id' | 'userId' | 'playerId'>;
    application?: Pick<Application, 'id'>;

    private async getConstansData() {
        await this.getAspectProxy()?.operate({
            entity: 'application',
            operation: {
                data: {
                    id: 1,
                    systemId: 1,
                    system: {
                        id: 1,
                    },
                },
                filter: {
                    id: this.applicationId,
                },
                action: 'select',
            }
        });
        if (this.tokenValue) {
            await this.getAspectProxy()?.operate({
                entity: 'token',
                operation: {
                    action: 'select',
                    data: {
                        id: 1,
                        userId: 1,
                        user: {
                            id: 1,
                            nickname: 1,
                        },
                        playerId: 1,
                        player: {
                            id: 1,
                            nickname: 1,
                        },
                    },
                    filter: {
                        id: this.tokenValue,
                    },
                }
            });
        }
    }

    private async setConstants(getData?: true) {
        if (getData) {
            await this.getConstansData();
        }
        const context = new CacheContext(this.cacheStore, this.application, this.token);
        if (this.tokenValue) {
            const { result } = await this.cacheStore.select('token', {
                data: {
                    id: 1,
                    userId: 1,
                    playerId: 1,
                },
                filter: {
                    id: this.tokenValue,
                }
            }, context);
            this.token = result[0] as any;
        }
        if (this.applicationId) {
            const { result: [application] } = await this.cacheStore.select('application', {
                data: {
                    id: 1,
                    systemId: 1,
                    system: {
                        id: 1,
                    },
                },
                filter: {
                    id: this.applicationId,
                }
            }, context);
            this.application = application as any;
        }
        await context.commit();
    }

    constructor(storageSchema: StorageSchema<ED>, applicationId: string, checkers?: Array<Checker<ED, keyof ED>>, tokenValue?: string) {
        const cacheStore = new CacheStore(storageSchema);
        generalCheckers.forEach(
            (checker) => cacheStore.registerChecker(checker as any)
        );
        if (checkers) {
            checkers.forEach(
                (checker) => cacheStore.registerChecker(checker)
            );
        }
        super();
        this.cacheStore = cacheStore;
        this.applicationId = applicationId;
        this.tokenValue = tokenValue;
        this.setConstants(true);
    }


    @Action
    refresh<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], params?: object) {
        return this.getAspectProxy().operate({
            entity: entity as any, 
            operation: assign({}, selection, { action: 'select' }) as DeduceSelection<ED[T]['Schema']>,
            params,
        });
    }

    @Action
    async sync(records: OpRecord<ED>[]) {
        const context = new CacheContext(this.cacheStore);
        try {
            await this.cacheStore.sync(records, context);
        }
        catch (err) {
            await context.rollback();
            throw err;
        }
        await context.commit();
    }

    @Action
    async operate<T extends keyof ED>(entity: T, operation: ED[T]['Operation'], commit: boolean = true, params?: OperateParams) {
        const context = new CacheContext(this.cacheStore);
        let result: Awaited<ReturnType<typeof this.cacheStore.operate>>;
        try {
            result = await this.cacheStore.operate(entity, operation, context, params);
            if (commit) {
                await context.commit();
            }
            else {
                await context.rollback();
            }
        }
        catch(err) {
            await context.rollback();
            throw err;
        }
        return result;        
    }

    
    @Action
    async loginByPassword(mobile: string, password: string) {
        this.tokenValue = await this.getAspectProxy().loginByPassword({ mobile, password });
        await this.setConstants();
        return;
    }

    async get<T extends keyof ED>(options: { entity: T, selection: ED[T]['Selection'], params?: object }) {
        const { entity, selection, params } = options;
        const context = new CacheContext(this.cacheStore);        
        const { result } = await this.cacheStore.select(entity, selection, context, params);
        return result;
    }

    judgeRelation(entity: keyof ED, attr: string) {
        return this.cacheStore.judgeRelation(entity, attr);
    }

    getTokenValue() {
        return this.tokenValue;
    }
}
