import { Feature } from "../types/Feature";
export class Geo extends Feature {
    aspectWrapper;
    constructor(aspectWrapper) {
        super();
        this.aspectWrapper = aspectWrapper;
    }
    searchPoi(value, areaCode, typeCode, indexFrom, count) {
        return this.aspectWrapper.exec('searchPoi', {
            value,
            areaCode,
            typeCode,
            indexFrom,
            count,
        });
    }
}
