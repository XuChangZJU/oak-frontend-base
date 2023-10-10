export default OakComponent({
    isList: false,
    properties: {
        entity: '',
    },
    data: {
        checkedActions: [],
        relationIds: [],
    },
    formData() {
        const { entity } = this.props;
        const actions = this.features.relationAuth.getActions(entity);
        const daas = this.features.relationAuth.getCascadeActionAuths(entity, false);
        const relations = this.features.cache.get('relation', {
            data: {
                id: 1,
                entity: 1,
                entityId: 1,
                name: 1,
                display: 1,
            },
            filter: {
                entity: entity,
                entityId: {
                    $exists: false,
                },
            }
        });
        const dras = this.features.relationAuth.getCascadeRelationAuths(entity, false);
        const deduceRelationAttr = this.features.relationAuth.getDeduceRelationAttribute(entity);
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
            if (this.features.relationAuth.hasRelation(entity)) {
                await this.features.cache.refresh('relation', {
                    data: {
                        id: 1,
                        entity: 1,
                        entityId: 1,
                        name: 1,
                        display: 1,
                    },
                    filter: {
                        entity: entity,
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
        onActionsSelected(checkedActions) {
            this.setState({ checkedActions });
        },
        onRelationsSelected(relationIds) {
            this.setState({ relationIds });
        }
    }
});
