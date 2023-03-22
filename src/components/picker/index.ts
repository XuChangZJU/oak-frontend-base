import { ED } from '../../types/AbstractComponent';
import { assert } from 'oak-domain/lib/utils/assert';

export default OakComponent({
    entity() {
        const { entity } = this.props;
        return entity as keyof ED;
    },
    formData({ data = [] }) {
        const { title } = this.props;
        return {
            rows: data.map(
                ele => ({
                    id: ele.id,
                    title: title!(ele)
                })
            ),
        };
    },
    isList: true,
    properties: {
        entity: String,
        multiple: Boolean,
        onSelect: Function,
        title: Function,
        titleLabel: String,
    },
    methods: {},
});
