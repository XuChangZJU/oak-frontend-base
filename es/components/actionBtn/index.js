import { resolvePath } from '../../utils/usefulFn';
export default OakComponent({
    isList: false,
    properties: {
        entity: '',
        extraActions: [],
        actions: [],
        cascadeActions: {},
        onAction: (() => undefined),
    },
    data: {
        showMore: false,
        schema: {},
        items: [],
        moreItems: [],
    },
    lifetimes: {
        // 在Tabel组件render之后 才走进这个组件，应该不会存在没有数据的问题
        async ready() {
            const schema = this.features.cache.getSchema();
            // 小程序这里还要跑一下
            if (process.env.OAK_PLATFORM === 'wechatMp') {
                this.makeItems();
            }
            this.setState({
                schema,
            });
        }
    },
    methods: {
        makeItems(isMobile) {
            const { schema } = this.state;
            const { actions, extraActions, onAction, entity, cascadeActions } = this.props;
            let column = 2;
            if (schema) {
                if (process.env.OAK_PLATFORM === 'web') {
                    column = 6;
                }
                if (process.env.OAK_PLATFORM === 'web' && isMobile) {
                    column = 2;
                }
                if (extraActions?.length || actions?.length) {
                    const actions2 = actions && [...actions] || [];
                    if (extraActions) {
                        // 用户传的action默认排在前面
                        const extraActions2 = extraActions.filter((ele) => ele.show) || [];
                        actions2.unshift(...extraActions2);
                    }
                    // 每一项里的action 和 path 用在小程序这边, onClick用于web
                    const items = actions2.map((ele) => ({
                        action: typeof ele !== 'string' ? ele.action : ele,
                        path: '',
                        label: this.getLabel(ele, entity),
                        onClick: () => onAction &&
                            onAction(typeof ele !== 'string' ? ele.action : ele, undefined),
                    }));
                    cascadeActions && Object.keys(cascadeActions).map((key, index) => {
                        const cascadeActionArr = cascadeActions[key];
                        if (cascadeActionArr && cascadeActionArr.length) {
                            cascadeActionArr.forEach((ele) => {
                                items.push({
                                    action: typeof ele !== 'string' ? ele.action : ele,
                                    path: key,
                                    label: this.getLabel2(schema, key, ele, entity),
                                    onClick: () => onAction && onAction(undefined, { path: key, action: typeof ele !== 'string' ? ele.action : ele }),
                                });
                            });
                        }
                    });
                    // 根据column显示几个，裁剪出在更多里显示的item
                    const moreItems = items.splice(column);
                    this.setState({
                        items,
                        moreItems
                    });
                }
            }
        },
        handleShow() {
            const { showMore } = this.state;
            this.setState({
                showMore: !showMore,
            });
        },
        onActionMp(e) {
            const { action, path } = e.currentTarget.dataset;
            if (path !== '') {
                // 级联action的点击
                this.triggerEvent('onAction', {
                    action: undefined,
                    cascadeAction: {
                        path,
                        action,
                    }
                });
                return;
            }
            this.triggerEvent('onAction', { action, cascadeAction: undefined });
        },
        getLabel(actionItem, entity) {
            let action = actionItem;
            if (typeof actionItem !== 'string') {
                if (actionItem.label) {
                    return actionItem.label;
                }
                action = actionItem.action;
            }
            if (this.features.locales.hasKey(`${entity}:action.${action}`)) {
                return this.t(`${entity}:action.${action}`);
            }
            return this.t(`common::action.${action}`);
        },
        getLabel2(schema, path, actionItem, entity) {
            let action = actionItem;
            if (typeof actionItem !== 'string') {
                if (actionItem.label) {
                    return actionItem.label;
                }
                action = actionItem.action;
            }
            const { entity: entityI18n } = resolvePath(schema, entity, path);
            if (this.features.locales.hasKey(`${entityI18n}:action.${action}`)) {
                return this.t(`${entityI18n}:action.${action}`);
            }
            return this.t(`common::action.${action}`);
        }
    },
});
