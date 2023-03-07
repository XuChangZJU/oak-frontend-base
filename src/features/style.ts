import { ColorDict } from 'oak-domain/lib/types/Style';
import { EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { Feature } from '../types/Feature';

export class Style<ED extends EntityDict & BaseEntityDict> extends Feature {
    colorDict: ColorDict<ED>;
    constructor(colorDict: ColorDict<ED>) {
        super();
        this.colorDict = colorDict;
    }

    getColorDict() {
        return this.colorDict;
    }
};
