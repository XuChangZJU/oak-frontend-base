export default OakComponent({
    entity() {
        const { entity } = this.props;
        return entity;
    },
    projection() {
        return this.props.projection;
    },
    filters: [
        {
            filter() {
                return this.props.filter;
            }
        },
    ],
    sorters: [
        {
            sorter() {
                return this.props.sorter;
            }
        }
    ],
    formData({ data = [] }) {
        const { title } = this.props;
        return {
            rows: data
        };
    },
    isList: true,
    properties: {
        entity: '',
        multiple: false,
        onSelect: (() => undefined),
        title: (() => ''),
        titleLabel: '',
        filter: [],
        sorter: [],
        projection: {},
    },
});
