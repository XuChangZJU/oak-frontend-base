import assert from "assert";
import { AuthCascadePath, EntityDict } from "oak-domain/lib/types";
import { ED } from "../../../types/AbstractComponent";

export default OakComponent({
    entity: 'actionAuth',
    projection: {
        id: 1,
        relationId: 1,
        path: 1,
        deActions: 1,
        destEntity: 1,
        relation: {
            id: 1,
            entity: 1,
            name: 1,
        },
    },
    isList: true,
    properties: {
        path: '',
        openTip: false,
        entity: '' as keyof ED,
        onClose: (() => undefined) as () => void,
    },
    filters: [
        {
            filter() {
                const { path, entity } = this.props;
                return {
                    destEntity: entity as string,
                    path: path?.replaceAll('(user)', ''),
                };
            },
            '#name': 'path',
        }
    ],
    pagination: {
        pageSize: 1000,
        currentPage: 0,
    },
    formData({ data: rows }) {
        return {
            rows
        };
    },
    data: {
        relations: [] as Partial<EntityDict['relation']['Schema']>[],
        actions: [] as string[],
    },
    listeners: {
        async path(prev, next) {
            if (prev.path !== next.path) {
                const { path, entity } = this.props;
                this.getRelationAndActions();
                this.addNamedFilter({
                    filter: {
                        path: path?.replaceAll('(user)', ''),
                        destEntity: entity as string,
                    },
                    '#name': 'path'
                }, true)
            }
        }
    },
    lifetimes: {
        async ready() {
            this.getRelationAndActions();
        }
    },
    methods: {
        async getRelationAndActions() {
            const { path, entity } = this.props;
            const entities = path!.split('.');
            const sourceEntity = entities[entities?.length - 1];
            const source = sourceEntity.includes('$') ? sourceEntity.split('$')[0] : sourceEntity;
            // 获取actions
            const actions = this.features.relationAuth.getActions(entity!);
            // 获取relation
            // user 没有relation
            if (source.includes('(user)')) {
                this.setState({
                    relations: [{id: '', name: '当前用户'}],
                    actions,
                })
                return;
            }
            const { data: relations } = await this.features.cache.refresh('relation', {
                data: {
                    id: 1,
                    entity: 1,
                    entityId: 1,
                    name: 1,
                    display: 1,
                },
                filter: {
                    entity: source,
                    entityId: {
                        $exists: false,
                    },
                },
            });
            this.setState({
                relations,
                actions,
            })
        }
    }
})