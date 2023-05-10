import assert from "assert";
import { pull } from 'oak-domain/lib/utils/lodash';
import { AuthCascadePath } from "oak-domain/lib/types";
import { ED } from "../../../types/AbstractComponent";

export default OakComponent({
    entity: 'freeActionAuth',
    isList: true,
    projection: {
        id: 1,
        deActions: 1,
        destEntity: 1,
    },
    properties: {
        entity: '' as keyof ED,
    },
    filters: [
        {
            filter() {
                const { entity } = this.props;
                return {
                    destEntity: entity as string,
                };
            }
        }
    ],
    formData({ data }) {
        const { entity } = this.props;
        const actions = this.features.relationAuth.getActions(entity!);
        return {
            actions,
            freeActionAuths: data,
        };
    },
    methods: {
        onChange(checked: boolean, action: string, freeActionAuth?: ED['freeActionAuth']['OpSchema']) {
            if (checked) {
                if (freeActionAuth) {
                    const { deActions } = freeActionAuth;
                    deActions.push(action);
                    this.updateItem({
                        deActions,
                    }, freeActionAuth.id);
                }
                else {
                    this.addItem({
                        destEntity: this.props.entity as string,
                        deActions: [action],
                    });
                }
            }
            else {
                assert(freeActionAuth);
                const { deActions } = freeActionAuth;
                pull(deActions, action);
                this.updateItem({
                    deActions,
                }, freeActionAuth.id);
            }
        },
        confirm() {
            this.execute();
        },
    }
})