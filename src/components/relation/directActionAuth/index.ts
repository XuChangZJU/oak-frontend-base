import assert from "assert";
import { pull } from 'oak-domain/lib/utils/lodash';
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
        action: '',
    },
    filters: [
        {
            filter() {
                const { entity, action } = this.props;
                if (!action) {
                    return {
                        destEntity: entity as string,
                    };
                }
                return {
                    destEntity: entity as string,
                    deActions: {
                        $contains: action,
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
            const { action } = this.props;
            assert(action);
            if (checked) {
                if (directActionAuth) {
                    const { deActions } = directActionAuth;
                    deActions.push(action);
                    this.updateItem({
                        deActions,
                    }, directActionAuth.id);
                }
                else {
                    this.addItem({
                        destEntity: path[0] as string,
                        sourceEntity: path[2] as string,
                        path: path[1],
                        deActions: [action],
                    });
                }
            }
            else {
                assert(directActionAuth);
                const { deActions } = directActionAuth;
                pull(deActions, action);
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