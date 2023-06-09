import assert from 'assert';
import { CardDef, ED, OakAbsAttrDef, onActionFnDef } from '../../../types/AbstractComponent';
export default OakComponent({
    entity: 'relation',
    isList: true,
    projection: {
        id: 1,
        name: 1,
        display: 1,
        entity: 1,
        entityId: 1,
    },
    formData({ data = [] }) {
        // 根据设计，这里如果同一个entity上同时存在有entityId和没有entityId的，则隐藏掉没有entityId的行
        const relations = data.filter(
            ele => !!ele.entityId
        );
        data.forEach(
            (ele) => {
                if (!ele.entityId) {
                    if (!relations.find(
                        (ele2) => ele2.entity === ele.entity && ele2.entityId
                    )) {
                        relations.push(ele);
                    }
                }
                else {
                    assert(ele.entityId === this.props.entityId);
                }
            }
        );

        const hasRelationEntites = this.features.relationAuth.getHasRelationEntities();
        return {
            relations,
            hasRelationEntites,
        };
    },
    filters: [
        {
            filter() {
                const { entity, entityId } = this.props;
                const filter = {};
                if (entity) {
                    Object.assign(filter, { entity });
                }
                if (entityId) {
                    Object.assign(filter, {
                        $or: [{
                            entityId: {
                                $exists: false,
                            },
                        }, {
                            entityId,
                        }]
                    });
                }
                else {
                    Object.assign(filter, {
                        entityId: {
                            $exists: false,
                        },
                    });
                }
                return filter;
            }
        }
    ],
    properties: {
        entity: '' as keyof ED,
        entityId: '',
    },
    features: ['relationAuth'],
    methods: {        
        onActionClicked(id: string, entity: string) {
            this.features.navigator.navigateTo({
                url: '/relation/actionAuthBySource',
            }, {
                relationId: id,
                entity,
            });
        },
        onRelationClicked(id: string, entity: string) {
            this.features.navigator.navigateTo({
                url: '/relation/relationAuthBySource',
            }, {
                relationId: id,
                entity,
            });
        }
    }
});