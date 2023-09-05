export default OakComponent({
    entity() {
        const { entity } = this.props;
        return entity;
    },
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
    },
});
