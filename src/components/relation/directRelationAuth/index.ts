// attention! 这个组件没有测试过，因为jichuang项目没有存在directRelationAuth的entity. by Xc 2023.05.06
import assert from "assert";
import { pull } from 'oak-domain/lib/utils/lodash';
import { AuthCascadePath, CascadeActionAuth } from "oak-domain/lib/types";
import { ED } from "../../../types/AbstractComponent";

export default OakComponent({
    entity: 'directRelationAuth',
    isList: true,
    projection: {
        id: 1,
        path: 1,
        destRelationId: 1,
    },
    properties: {
        entity: '' as keyof ED,
        relationId: '',
    },
    filters: [
        {
            filter() {
                const { entity, relationId } = this.props;
                if (relationId) {
                    return {
                        destRelationId: relationId,
                    };
                }
                else {
                    return {
                        destRelation: {
                            entity: entity as string,
                            entityId: {
                                $exists: false,
                            },
                        },
                    };
                }
            },
        }
    ],
    formData({ data }) {
        const { entity } = this.props;
        const auths = this.features.relationAuth.getCascadeRelationAuths(entity!, false);

        return {
            auths,
            directRelationAuths: data,
        };
    },
    methods: {
        onChange(checked: boolean, path: AuthCascadePath<ED>, directRelationAuth?: ED['directRelationAuth']['OpSchema']) {
            if (checked) {
                if (directRelationAuth) {
                    assert(directRelationAuth.$$deleteAt$$);
                    this.recoverItem(directRelationAuth.id);
                }
                else {
                    this.addItem({
                        path: path[1],
                        destRelationId: this.props.relationId,
                    });
                }
            }
            else {
                assert(directRelationAuth && !directRelationAuth.$$deleteAt$$);
                this.removeItem(directRelationAuth.id);
            }
        },
        confirm() {
            this.execute();
        },
    }
})