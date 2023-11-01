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
        onClicked: (entity) => undefined,
    },
    methods: {
        onEntityClicked(entity) {
            assert(this.props.onClicked);
            this.props.onClicked(entity);
        },
    },
});
