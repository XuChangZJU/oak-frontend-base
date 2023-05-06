
import { AuthCascadePath, EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';

type ED = EntityDict & BaseEntityDict;

export default OakComponent({
    isList: false,
    properties: {
        entity: '' as keyof ED,
    },
    data: {
        action: '',
    },
    formData() {
        const { entity } = this.props;
        const actions = this.features.relationAuth.getActions(entity!);
        const daas = this.features.relationAuth.getCascadeActionAuths(entity!, false);
        return {
            actions,
            hasDirectActionAuth: daas.length > 0,
        };
    },
    methods: {
        onActionSelected(action: string) {
            this.setState({ action });
        }
    }
});