import './utils/wx.polyfill';
import { Aspect, AspectWrapper, Checker, Trigger, StorageSchema, Context, RowStore, Watcher } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { Feature } from './types/Feature';
import { BasicFeatures } from './features';
import { ActionDictOfEntityDict } from 'oak-domain/lib/types/Action';
import { CommonAspectDict } from 'oak-common-aspect';
import { I18nOptions } from './platforms/web/i18n';
export declare function initialize<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature>>(storageSchema: StorageSchema<ED>, createFeatures: (aspectWrapper: AspectWrapper<ED, Cxt, AD>, basicFeatures: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>) => FD, frontendContextBuilder: (features: FD & BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>) => (store: RowStore<ED, Cxt>) => Cxt, backendContextBuilder: (contextStr?: string) => (store: RowStore<ED, Cxt>) => Promise<Cxt>, aspectDict: AD, triggers?: Array<Trigger<ED, keyof ED, Cxt>>, checkers?: Array<Checker<ED, keyof ED, Cxt>>, watchers?: Array<Watcher<ED, keyof ED, Cxt>>, initialData?: {
    [T in keyof ED]?: Array<ED[T]['OpSchema']>;
}, actionDict?: ActionDictOfEntityDict<ED>, i18nOptions?: I18nOptions): {
    i18n: import("i18next").i18n;
    features: FD & BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>;
};
