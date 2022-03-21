import { RunningContext } from 'oak-domain/lib/types/Context';
import { Schema as Token } from 'oak-domain/lib/entities/Token';
import { EntityDict, OperationResult } from 'oak-domain/lib/types/Entity';

export async function loginMp<ED extends EntityDict> (params: { code: string }, context: RunningContext<ED>): Promise<string> {
    const { rowStore } = context;
    throw new Error('method not implemented!');
}

export async function loginByPassword<ED extends EntityDict>(params: { password: string, mobile: string }, context: RunningContext<ED>): Promise<string> {
    const { rowStore } = context;
    throw new Error('method not implemented!');
}
