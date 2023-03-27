export default OakComponent({
    isList: false,
    properties: {
        entity: String,
        extraActions: {
            type: Array,
            value: [],
        },
        actions: {
            type: Array,
            value: [],
        },
        cascadeActions: Object,
        onAction: Object,
    },
    data: {
    },
    lifetimes: {
        // 在list组件render之后 才走进这个组件，应该不会存在没有数据的问题
        async ready() {
            const { actions, extraActions } = this.props;
            const schema = this.features.cache.getSchema();
            if (extraActions && actions && extraActions.length) {
                actions.unshift(...extraActions);
            }
            this.setState({
                schema,
            })
        }
    },
    methods: {
    },
});
