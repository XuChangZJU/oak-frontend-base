
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ED } from '../../types/AbstractComponent';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { resolvePath } from '../../utils/usefulFn';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { ActionDef } from '../../types/Page';

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
        onAction: Function,
    },
    data: {
        showMore: false,
    },
    lifetimes: {
        // 在Tabel组件render之后 才走进这个组件，应该不会存在没有数据的问题
        async ready() {
            const { actions, extraActions, onAction, entity, cascadeActions } = this.props;
            const schema = this.features.cache.getSchema();
            let column = 2;
            if (process.env.OAK_PLATFORM === 'web') {
                column = 6;
            }
            if (actions && actions.length) {
                if (extraActions && extraActions.length) {
                    // 用户传的action默认排在前面
                    actions.unshift(...extraActions);
                }
                // 每一项里的action 和 path 用在小程序这边, onClick用于web
                const items = actions.map((ele) => ({
                    action: typeof ele !== 'string' ? ele.action : ele,
                    path: '',
                    label: this.getLabel(ele, entity!),
                    onClick: () => onAction && onAction(typeof ele !== 'string' ? ele.action : ele, undefined),
                }))
                cascadeActions && Object.keys(cascadeActions).map((key, index: number) => {
                    const cascadeActionArr = cascadeActions[key];
                    if (cascadeActionArr && cascadeActionArr.length) {
                        cascadeActionArr.forEach((ele: ActionDef<ED, string | number>) => {
                            items.push({
                                action: typeof ele !== 'string' ? ele.action : ele,
                                path: key,
                                label: this.getLabel2(schema, key, ele, entity!),
                                onClick: () => onAction && onAction(undefined, { path: key, action: typeof ele !== 'string' ? ele.action : ele }),
                            })
                        })
                    }
                })
                const moreItems = items.splice(column);
                this.setState({
                    items,
                    moreItems
                })
            }
            this.setState({
                schema,
            })
        }
    },
    methods: {
        handleShow() {
            const { showMore } = this.state;
            this.setState({
                showMore: !showMore,
            })
        },
        onActionMp(e: WechatMiniprogram.TouchEvent) {
            const { action, path } = e.currentTarget.dataset;
            if (path !== '') {
                // 级联action的点击
                this.triggerEvent('onAction', {
                    action: undefined,
                    cascadeAction: {
                        path,
                        action,
                    }
                })
                return;
            }
            this.triggerEvent('onAction', { action, cascadeAction: undefined })
        },
        getLabel(actionItem: ActionDef<ED, keyof EntityDict>, entity: String) {
            if(typeof actionItem !== 'string') {
                return actionItem.label!
            }
                else {
                if (['update', 'create', 'detail'].includes(actionItem)) {
                    return this.t(`common:action.${actionItem}`)
                }
                else {
                    return this.t(`${entity}:action.${actionItem}`)
                }
            }
        },
        getLabel2(schema: StorageSchema<ED>, path: string, actionItem: ActionDef<ED, keyof EntityDict>, entity: string) {
            if(typeof actionItem !== 'string') {
                return actionItem.label!;
            }
            const { entity: entityI18n } = resolvePath(schema, entity, path);
            const label = this.t(`${entityI18n}:action.${actionItem}`)
            return label;
        }
    },
});
