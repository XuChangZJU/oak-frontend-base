import { ED } from '../../types/AbstractComponent';
import { assert } from 'oak-domain/lib/utils/assert';

export default OakComponent({
    entity() {
        const { entity } = this.props;
        return entity as keyof ED;
    },
    projection() {
        const { projection } = this.props;
        return projection;
    },
    formData({ data: rows }) {
        return {
            rows,
        };
    },
    isList: true,
    data: {
        open: false,
    },
    properties: {
        entity: String,
        projection: Object,
        multiple: Boolean,
        onSelect: Function,
    },
    methods: {},
});
