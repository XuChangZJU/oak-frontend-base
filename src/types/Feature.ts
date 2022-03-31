import { pull } from 'lodash';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { aspectDict as basicAspectDict} from 'oak-general-business';
import { FrontContext } from '../FrontContext';
import { AspectProxy } from './AspectProxy';

type Action = {
    type: string;
    payload?: object;
};

export abstract class Feature<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> {
    private aspectProxy?: AspectProxy<ED, AD & typeof basicAspectDict>;    

    abstract get(context: FrontContext<ED>, params: any): any;

    abstract action(context: FrontContext<ED>, action: Action): any;

    protected getAspectProxy() {
        return this.aspectProxy!;
    }

    setAspectProxy(aspectProxy: AspectProxy<ED, AD & typeof basicAspectDict>) {
        this.aspectProxy = aspectProxy;
    }
}
