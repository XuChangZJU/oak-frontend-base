
import { AuthCascadePath, EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';

type ED = EntityDict & BaseEntityDict;

export default OakComponent({
    isList: false,
    properties: {
        entity: '' as keyof ED,
    },
    data: {
        checkedActions: [] as string[],
        relationIds: [] as string[],
    },
    formData() {
        const entity  = this.props.entity;
        const actions = this.features.relationAuth.getActions(entity!);
        const daas = this.features.relationAuth.getCascadeActionAuths(entity!, false);
        const relations = this.features.cache.get('relation', {
            data: {
                id: 1,
                entity: 1,
                entityId: 1,
                name: 1,
                display: 1,
            },
            filter: {
                entity: entity as string,
                entityId: {
                    $exists: false,
                },
            }
        });
        const dras = this.features.relationAuth.getCascadeRelationAuths(entity!, false);
        const deduceRelationAttr = this.features.relationAuth.getDeduceRelationAttribute(entity!);
        return {
            relations,
            actions,
            daas,
            dras,
            hasDirectActionAuth: daas.length > 0,
            hasDirectRelationAuth: dras.length > 0,
            deduceRelationAttr,
        };
    },
    lifetimes: {
        async ready() {
            const { entity } = this.props;
            // 现在的数据结构，可以在任意对象上增加relation，这个if以后并不成立。 by Xc
            if (this.features.relationAuth.hasRelation(entity!)) {
                await this.features.cache.refresh('relation', {
                    data: {
                        id: 1,
                        entity: 1,
                        entityId: 1,
                        name: 1,
                        display: 1,
                    },
                    filter: {
                        entity: entity as string,
                        entityId: {
                            $exists: false,
                        },
                    }
                });
                // 没定义entity，显式的reRender
                this.reRender();
            }
        }
    },
    methods: {
        onActionsSelected(checkedActions: string[]) {
            this.setState({ checkedActions });
        },
        onRelationsSelected(relationIds: string[]) {
            this.setState({ relationIds });
        }
    }
});