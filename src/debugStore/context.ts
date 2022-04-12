import assert from 'assert';
import { BaseEntityDict } from "oak-general-business/lib/base-ed/EntityDict";
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { Context as BaseContext } from 'oak-memory-tree-store';
import { Schema as Application } from "oak-general-business/lib/base-ed/Application/Schema";
import { Schema as Token } from 'oak-general-business/lib/base-ed/Token/Schema';
import { DebugStore } from './debugStore';
import { RuntimeContext } from 'oak-general-business';

export class DebugContext<ED extends BaseEntityDict & EntityDict> extends BaseContext<ED> implements RuntimeContext<ED> {
    getApplication: () => Pick<Token, 'id' | 'userId' | 'playerId'> | undefined;
    getToken: () => Pick<Application, 'id'> | undefined;

    async initGetFn(applicationId?: string, tokenValue?: string) {
        if (applicationId) {
            const { result: [application] } = await this.rowStore.select('application', {
                data: {
                    id: 1,
                    systemId: 1,
                    system: {
                        id: 1,
                    },
                },
                filter: {
                    id: applicationId,
                }
            }, this);
            this.getApplication = () => application as Application;
        }

        if (tokenValue) {
            const { result } = await this.rowStore.select('token', {
                data: {
                    id: 1,
                    userId: 1,
                    playerId: 1,
                },
                filter: {
                    id: tokenValue,
                }
            }, this);
            const token = result[0] as Token;
            // todo 判断 token的合法性
            this.getToken = () => token;
        }
    }

    constructor(store: DebugStore<ED>, applicationId?: string, tokenValue?: string) {
        super(store);
        this.getApplication = () => undefined;
        this.getToken = () => undefined;
        
        this.initGetFn(applicationId, tokenValue);
    }
    txn?: {
        events: {
            commit: Array<(context: DebugContext<ED>) => Promise<void>>;
            rollback: Array<(context: DebugContext<ED>) => Promise<void>>;
        }
    };
    on(event: "commit" | "rollback", callback: (context: any) => Promise<void>): void {
        this.txn!.events[event].push(callback);
    }

    async begin(options?: object): Promise<void> {
        assert(!this.txn);
        await super.begin();
        this.txn = {
            events: {
                commit: [],
                rollback: [],
            },
        };
    }
    async commit(): Promise<void> {
        await super.commit();
        for (const fn of this.txn!.events.commit) {
            await fn(this);
        }
        this.txn = undefined;
    }
    async rollback(): Promise<void> {
        await super.rollback();
        for (const fn of this.txn!.events.rollback) {
            await fn(this);
        }
        this.txn = undefined;
    }
}