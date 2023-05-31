import assert from 'assert';
import { CardDef, ED, OakAbsAttrDef, onActionFnDef } from '../../../types/AbstractComponent';
export default OakComponent({
    isList: true,
    formData() {
        const { data, links } = this.features.relationAuth.getEntityGraph();
        return {
            data,
            links,
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