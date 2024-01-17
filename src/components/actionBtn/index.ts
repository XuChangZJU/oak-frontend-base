
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ED, OakExtraActionProps } from '../../types/AbstractComponent';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { resolvePath } from '../../utils/usefulFn';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { ActionDef } from '../../types/Page';

export default OakComponent({
    isList: false,
    properties: {
        entity: '' as keyof ED,
        extraActions: [] as OakExtraActionProps[],
        actions: [] as ActionDef<ED, keyof ED>[],
        cascadeActions: {} as {
            [K in keyof ED[keyof ED]['Schema']]?: ActionDef<ED, keyof ED>[];
        },
        onAction: (() => undefined) as Function,
    },
    data: {
        showMore: false,
        schema: {} as StorageSchema<EntityDict & BaseEntityDict>,
        items: [] as { action: string; label: string; path: string; onClick: () => void }[],
        moreItems: [] as { action: string; label: string; path: string; onClick: () => void }[],
    },
    lifetimes: {
        // 在Tabel组件render之后 才走进这个组件，应该不会存在没有数据的问题
        async ready() {
            const schema = this.features.cache.getSchema();
            // 小程序这里还要跑一下
            if (process.env.OAK_PLATFORM === 'wechatMp') {
                this.makeItems()
            }
            this.setState({
                schema,
            })
        }
    },
    methods: {
        makeItems(isMobile?: boolean) {
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
                        label: this.getLabel(ele, entity!),
                        onClick: () =>
                            onAction &&
                            onAction(
                                typeof ele !== 'string' ? ele.action : ele,
                                undefined
                            ),
                    }));
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
                    // 根据column显示几个，裁剪出在更多里显示的item
                    const moreItems = items.splice(column);
                    this.setState({
                        items,
                        moreItems
                    })
                }
            }
        },
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
        getLabel(actionItem: ActionDef<ED, keyof ED>, entity: keyof ED) {
            if(typeof actionItem !== 'string') {
                return actionItem.label!
            }
                else {
                if (['update', 'create', 'detail', 'remove'].includes(actionItem)) {
                    return this.t(`common::action.${actionItem}`)
                }
                else {
                    return this.t(`${entity}:action.${actionItem}`)
                }
            }
        },
        getLabel2(schema: StorageSchema<ED>, path: string, actionItem: ActionDef<ED, keyof ED>, entity: keyof ED) {
            if(typeof actionItem !== 'string') {
                return actionItem.label!;
            }
            const { entity: entityI18n } = resolvePath(schema, entity, path);
            const label = this.t(`${entityI18n}:action.${actionItem}`)
            return label;
        }
    },
});
