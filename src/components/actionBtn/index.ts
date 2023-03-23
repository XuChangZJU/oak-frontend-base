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
        cascadeActions: {
            type: Array,
            value: [],
        },
        onAction: Object,
        schema: Object,
    },
    data: {
    },
    lifetimes: {
        async ready() {
            const { actions, extraActions } = this.props;
            if (extraActions && actions && extraActions.length) {
                actions.unshift(...extraActions);
            }
        }
    },
    methods: {
    },
});
