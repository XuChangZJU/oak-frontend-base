import assert from "assert";
import { pull, union } from 'oak-domain/lib/utils/lodash';
import { AuthCascadePath, CascadeActionAuth } from "oak-domain/lib/types";
import { ED } from "../../../types/AbstractComponent";

export default OakComponent({
    entity: 'directActionAuth',
    isList: true,
    projection: {
        id: 1,
        deActions: 1,
        path: 1,
        destEntity: 1,
        sourceEntity: 1,
    },
    properties: {
        entity: '' as keyof ED,
        actions: [] as string[],
    },
    filters: [
        {
            filter() {
                const { entity, actions } = this.props;
                if (!actions || actions.length === 0) {
                    return {
                        destEntity: entity as string,
                    };
                }
                return {
                    destEntity: entity as string,
                    deActions: {
                        $overlaps: actions,
                    },
                };
            }
        }
    ],
    formData({ data }) {
        const { entity } = this.props;
        const paths = this.features.relationAuth.getCascadeActionAuths(entity!, false);
        return {
            paths,
            directActionAuths: data,
        };
    },
    methods: {
        onChange(checked: boolean, path: AuthCascadePath<ED>, directActionAuth?: ED['directActionAuth']['OpSchema']) {
            const { actions } = this.props;
            assert(actions!.length > 0);
            if (checked) {
                if (directActionAuth) {
                    const { deActions } = directActionAuth;
                    const deActions2 = union(deActions, actions);
                    this.updateItem({
                        deActions: deActions2,
                    }, directActionAuth.id);
                }
                else {
                    this.addItem({
                        destEntity: path[0] as string,
                        sourceEntity: path[2] as string,
                        path: path[1],
                        deActions: actions,
                    });
                }
            }
            else {
                assert(directActionAuth);
                const { deActions } = directActionAuth;
                actions?.forEach(
                    action => pull(deActions, action)
                );
                this.updateItem({
                    deActions,
                }, directActionAuth.id);
            }
        },
        confirm() {
            this.execute();
        },
    }
})