import { Aspect, Checker, Context, EntityDict, RowStore } from 'oak-domain/lib/types';

import { Cache } from './cache';
import { Location } from './location';
import { Upload } from './upload';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { RunningTree } from './runningTree';
import { Locales } from './locales';

export function initialize<ED extends EntityDict, Cxt extends Context<ED>, 
    AD extends Record<string, Aspect<ED, Cxt>>> (
        storageSchema: StorageSchema<ED>,
        createContext: (store: RowStore<ED, Cxt>, scene: string) => Cxt,
        checkers?: Array<Checker<ED, keyof ED, Cxt>>): BasicFeatures<ED, Cxt, AD> {
    const cache = new Cache<ED, Cxt, AD>(storageSchema, createContext, checkers);
    const location = new Location();
    const runningTree = new RunningTree<ED, Cxt, AD>(cache);
    const upload = new Upload();
    const locales = new Locales();
    return {
        cache,
        location,
        runningTree,
        upload,
        locales,
    };
}

export type BasicFeatures<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>
> = {
    cache: Cache<ED, Cxt, AD>;
    location: Location;
    runningTree: RunningTree<ED, Cxt, AD>;
    upload: Upload;
    locales: Locales;
};
