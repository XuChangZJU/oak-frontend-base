import { Feature } from "../types/Feature";
export class Port extends Feature {
    aspectWrapper;
    constructor(aspectWrapper) {
        super();
        this.aspectWrapper = aspectWrapper;
    }
    importEntity(entity, id, file, option) {
        const formData = new FormData();
        formData.set('entity', entity);
        formData.set('id', id);
        formData.set('file', file);
        formData.set('option', JSON.stringify(option));
        return this.aspectWrapper.exec('importEntity', formData);
    }
    exportEntity(entity, id, filter, properties) {
        return this.aspectWrapper.exec('exportEntity', { entity, id, filter, properties });
    }
    getImportationTemplate(id) {
        return this.aspectWrapper.exec('getImportationTemplate', { id });
    }
}
