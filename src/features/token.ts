import { EntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Feature } from '../types/Feature';
import { FrontContext } from '../types/FrontContext';

export class Token<ED extends EntityDict> extends Feature<ED> {
    get(params?: any) {
        throw new Error('Method not implemented.');
    }
    action(context: FrontContext<ED>, type: string, payload?: any) {
        throw new Error('Method not implemented.');
    }
}

console.log(Token.name);