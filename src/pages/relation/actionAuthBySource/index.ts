import assert from "assert";
import { ED } from "../../../types/AbstractComponent";

export default OakComponent({
    entity: 'actionAuth',
    projection: {
        id: 1,
        relationId: 1,
        paths: 1,
        deActions: 1,
        destEntity: 1,
        relation: {
            id: 1,
            entity: 1,
        },
    },
    isList: true,
    properties: {
        relationId: '',
        entity: '' as keyof ED,
    },
    filters: [
        {
            filter() {
                const { relationId } = this.props;
                assert(relationId);
                return {
                    relationId,
                };
            }
        }
    ],
    pagination: {
        pageSize: 1000,
        currentPage: 0,
    },
    formData({ data }) {
        const { entity, relationId } = this.props;
        const [relation] = this.features.cache.get('relation', {
            data: {
                id: 1,
                name: 1,
                display: 1,
            },
            filter: {
                id: relationId,
            },
        });
        const { name } = relation || {};
        const cascadeEntities = this.features.relationAuth.getCascadeActionEntitiesBySource(entity!);
        const cascadeEntityActions = cascadeEntities.map(
            (ele) => {
                const { path } = ele;
                const cascadePath = path[1];

                const actionAuth = data?.find(
                    ele => false/* ele.paths?.includes(cascadePath) && ele.destEntity === path[0] */
                );
                return {
                    actionAuth,
                    ...ele,
                };
            }
        );
        return {
            relationName: name,
            cascadeEntityActions,
        };
    },
    methods: {
        onChange(actions: string[], path: any, actionAuth?: ED['actionAuth']['OpSchema']) {
            if (actionAuth) {
                this.updateItem({
                    deActions: actions,
                }, actionAuth.id);
            }
            else {
                /* this.addItem({
                    relationId: this.props.relationId,
                    paths: [path[1]],
                    destEntity: path[0] as string,
                    deActions: actions,
                }); */
            }
        },
        confirm() {
            this.execute();
        }
    }
})