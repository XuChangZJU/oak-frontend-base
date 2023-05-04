import assert from 'assert';
import { CardDef, ED, OakAbsAttrDef, onActionFnDef } from '../../../types/AbstractComponent';
export default OakComponent({
    isList: true,
    formData() {
        const entities = this.features.relationAuth.getAllEntities();
        return {
            entities,
        };
    },
    properties: {
        onEntityClicked: (entity: string) => undefined,
    },
    methods: {
        onEntityClicked(entity: string) {
            this.props.onEntityClicked!(entity);
        }
    }
});