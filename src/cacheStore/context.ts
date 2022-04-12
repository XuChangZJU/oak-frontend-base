import { EntityDict } from 'oak-domain/lib/types/Entity';
import { RuntimeContext } from 'oak-general-business';
import { BaseEntityDict } from 'oak-general-business/lib/base-ed/EntityDict';
import { Schema as Application } from 'oak-general-business/src/base-ed/Application/Schema';
import { Schema as Token } from 'oak-general-business/src/base-ed/Token/Schema';
import { Context } from 'oak-memory-tree-store';
import { CacheStore } from './CacheStore';

export class CacheContext<ED extends EntityDict & BaseEntityDict> extends Context<ED> implements RuntimeContext<ED> {
    getApplication: () => Pick<Application, 'id'> | undefined;
    getToken: () => Pick<Token, 'id' | 'userId' | 'playerId'> | undefined;

    constructor(store: CacheStore<ED>, application?: Pick<Application, 'id'>, token?: Pick<Token, 'id' | 'userId' | 'playerId'>) {
        super(store);
        this.getApplication = () => application;
        this.getToken = () => token;
    }

    
    on(event: "commit" | "rollback", callback: (context: any) => Promise<void>): void {
        throw new Error('disallow cross txn events in FrontContext');
    }
};