import { assert } from 'oak-domain/lib/utils/assert';
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
        onClicked: (entity: string) => undefined as void,
    },
    methods: {
        onEntityClicked(entity: string) {
            assert(this.props.onClicked);
            this.props.onClicked(entity);
        },
    },
});
