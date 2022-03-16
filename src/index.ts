import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Trigger } from "oak-domain/lib/types/Trigger";
import { EntityDict } from 'oak-domain/src/base-domain/EntityDict';

import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Feature } from './types/Feature';
import { CacheStore } from './dataStore/CacheStore';
import { loginMp } from './aspects/token';

import { Token } from './features/token';
const FEATURES: Array<new <ED extends EntityDict>() => Feature<ED>> = [Token];

export function initialize<ED extends EntityDict>(storageSchema: StorageSchema<ED>,
    features?: Array<Feature<ED>>,
    triggers?: Array<Trigger<ED, keyof ED>>,
    initialData?: Object,
    aspects?: Array<Aspect<ED>>) {

    const store = new CacheStore<ED>(storageSchema);

}

