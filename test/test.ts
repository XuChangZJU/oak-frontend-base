import { EntityDict } from './app-domain/EntityDict';
import { storageSchema } from './app-domain/Storage';

import { initialize } from '../src/index';
import { RunningContext } from 'oak-domain/lib/types/Context';
import { Feature } from '../src/types/Feature';
import { BasicFeatures } from '../src/features/index';


class FeatureTest extends Feature<EntityDict, typeof aspectDict> {
    async get(params?: any): Promise<any> {
        this.getAspectProxy().select({
            entity: 'user',
            selection: {
                data: {
                    idd: 1,
                }
            },
        })
    }
    protected async action<T extends keyof EntityDict>(entity: T) {
        return 123;
    }
}

type Actions = {
    featureTest: {
        action: FeatureTest['action'];
    }
}


function createFeatures(bf: BasicFeatures<EntityDict, typeof aspectDict>) {
    return {
        featureTest: new FeatureTest(),
    };
}

async function test(params: string, context: RunningContext<EntityDict>) {
    return 1;
}

const aspectDict = {
    test,
};

async function init() {
    const { action } = await initialize<EntityDict, typeof aspectDict, ReturnType<typeof createFeatures>, Actions>(storageSchema, '11', (bf) => {
        bf.cache
        return {
            featureTest: new FeatureTest(),
        };
    }, []);

    const result2 = action('featureTest', 'action', 'token');
    
    return result2;
}

init().then(
    (r) => console.log(r)
);
