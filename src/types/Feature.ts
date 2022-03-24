import { pull } from 'lodash';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { aspectDict as basicAspectDict} from 'oak-general-business';
import { FrontContext } from '../FrontContext';
import { AspectProxy } from './AspectProxy';

export abstract class Feature<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>> {
    private aspectProxy?: AspectProxy<ED, AD & typeof basicAspectDict>;
    private context?: FrontContext<ED>;

    protected getAspectProxy() {
        return this.aspectProxy!;
    }

    setAspectProxy(aspectProxy: AspectProxy<ED, AD & typeof basicAspectDict>) {
        this.aspectProxy = aspectProxy;
    }

    protected getContext() {
        return this.context!;
    }

    setFrontContext(context: FrontContext<ED>)  {
        this.context = context;
    }
}
