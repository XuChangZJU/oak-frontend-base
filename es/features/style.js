import { Feature } from '../types/Feature';
export class Style extends Feature {
    colorDict;
    constructor(colorDict) {
        super();
        this.colorDict = colorDict;
    }
    getColorDict() {
        return this.colorDict;
    }
}
;
