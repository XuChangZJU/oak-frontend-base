import { assert } from 'oak-domain/lib/utils/assert';
import {
    CardDef,
    ED,
    OakAbsAttrDef,
    onActionFnDef,
} from '../../../types/AbstractComponent';
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
        onEntityClicked: (entity: string) => undefined as void,
    },
    methods: {
        onEntityClicked(entity: string) {
            if (this.props.onEntityClicked) {
                this.props.onEntityClicked(entity);
            } else {
                if (process.env.NODE_ENV === 'development') {
                    console.warn(
                        '直接使用relation/entityList作为page用法即将废除，请使用自定义页面包裹'
                    );
                }
                this.features.navigator.navigateTo(
                    {
                        url: '/relation/entity',
                    },
                    {
                        entity,
                    }
                );
            }
        },
    },
});