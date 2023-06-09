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
    methods: {
        onEntityClicked(entity: string) {
            this.features.navigator.navigateTo({
                url: '/relation/entity',
            }, {
                entity,
            });
        },
    }
});