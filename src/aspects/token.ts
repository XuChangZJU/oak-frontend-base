import { RunningContext } from 'oak-domain/lib/types/Context';
import { Schema as Token } from 'oak-domain/lib/entities/Token';
import { EntityDict as BaseEntityDict} from 'oak-domain/lib/base-domain/EntityDict';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { Aspect } from 'oak-domain/lib/types/Aspect';

export async function loginMp<ED extends EntityDict> (params: { code: string }, context: RunningContext<ED>): Promise<Token> {
    const { rowStore } = context;
    throw new Error('method not implemented!');
}

export async function loginByPassword<ED extends EntityDict>(params: { password: string, mobile: string }, context: RunningContext<ED>): Promise<Token> {
    const { rowStore } = context;
    throw new Error('method not implemented!');
}
