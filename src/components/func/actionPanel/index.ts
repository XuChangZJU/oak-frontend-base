export default OakComponent({
    isList: false,
    properties: {
        onActionClick: (() => undefined) as (action: string) => void,
        actions: [] as string[],
        actionDescriptions: {} as any,
        iconSize: '',
        rowNum: 4,
    },
    methods: {
        onClickMp(e: WechatMiniprogram.TouchEvent) {
            const { index } = e.detail;
            const action = this.props.actions![index];
            this.triggerEvent('action', { action });
        },
    },
    listeners: {
        actions(prev, next) {
            if (prev.actions !== next.actions) {
                const { actionDescriptions } = this.props;
                const actionss = next.actions?.map((action: string) =>
                    Object.assign({}, actionDescriptions![action], {
                        action,
                    })
                );
                this.setState({ actionss });
            }
        },
    },

    lifetimes: {
        ready() {
            const { actions, actionDescriptions } = this.props;

            if (actions) {
                const actionss = actions.map((action: string) =>
                    Object.assign({}, actionDescriptions![action], { action })
                );
                this.setState({ actionss });
            }
        },
    },
});
