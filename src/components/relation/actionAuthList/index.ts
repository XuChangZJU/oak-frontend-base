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
    },
    filters: [
        {
            filter() {
                const { path, entity } = this.props;
                return {
                    destEntity: entity as string,
                    path,
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
        console.log(this.props.path);
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
                        path,
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
            // 获取relation
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
            // 获取actions
            const actions = this.features.relationAuth.getActions(entity!);
            this.setState({
                relations,
                actions,
            })
        }
    }
})