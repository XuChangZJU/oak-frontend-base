import { ED } from '../../types/AbstractComponent';
import { assert } from 'oak-domain/lib/utils/assert';
import { judgeRelation } from 'oak-domain/lib/store/relation';
import { getAttributes } from '../query/utils';

export default OakComponent({
    entity() {
        const { entity } = this.props;
        return entity as keyof ED;
    },
    isList: true,
    data: {
        open: false,
    },
    properties: {
        entity: String,
        column: Object,
        formItem: Boolean,
    },
    methods: {
        getNamedFilter(name: string) {
            if (this.state.oakFullpath) {
                const filter = this.getFilterByName(name);
                return filter;
            }
        },
        getRefByAttr(entity: keyof ED, field: string) {
            if (!this.state.oakFullpath) {
                return;
            }
            const dataSchema = this.features.cache.getSchema();
            const attrs = field.split('.');

            let idx = 0;
            let _entity = entity;
            let attr;
            let attrType;
            let attribute;
            let entityI18n = entity;
            let attrI18n;
            while (idx <= attrs.length - 1) {
                attr = attrs[idx];
                attrI18n = attr;
                const relation = judgeRelation(dataSchema, _entity, attr);
                if (relation === 1) {
                    const attributes = getAttributes(
                        dataSchema[_entity].attributes
                    );
                    attribute = attributes[attr];
                    attrType = attribute.type;
                    if (attrType === 'ref') {
                        attrI18n = attribute.ref;
                    }
                } else if (relation === 2) {
                    // entity entityId
                    const ref = attr as keyof ED;
                    _entity = ref;
                    entityI18n = ref;
                } else if (typeof relation === 'string') {
                    const ref = relation as keyof ED;
                    _entity = ref;
                    entityI18n = ref;
                }

                idx++;
            }

            return {
                entity: _entity,
                attr,
                attrType,
                entityI18n,
                attrI18n,
                attribute,
            };
        },

        getEntityData(entity: keyof ED, ids: string[]) {
            const { column } = this.props;
            const projection = column?.refProps?.projection || { id: 1, name: 1 };

            const entityData = this.features.cache.get(
                entity,
                {
                    data: projection,
                    filter: {
                        id: {
                            $in: ids,
                        },
                    },
                },
                true
            );
            return entityData;
        },
    },
});
