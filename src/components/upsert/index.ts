import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { DataUpsertTransformer } from '../../types/AbstractComponent';
import { analyzeDataUpsertTransformer } from '../../utils/usefulFn';

export default OakComponent({
    isList: false,
    entity() {
        return this.props.entity as any;
    },
    properties: {
        entity: String,
        attributes: Array,
        data: Object,
        children: Object,
    },
    formData() {
        const { data } = this.props;
        const { transformer } = this.state;
        const renderData = transformer(data!);
        return {
            renderData,
        };
    },
    data: {
        transformer: (() => []) as DataUpsertTransformer<EntityDict & BaseEntityDict>,
    },
    listeners: {
        data() {
            this.reRender();
        },
    },
    lifetimes: {
        ready() {
            const { attributes, entity } = this.props;
            const schema = this.features.cache.getSchema();
            
            const transformer = analyzeDataUpsertTransformer(schema, entity!, attributes!, (k, params) => this.t(k, params));
            this.setState({
                transformer,
            });
        }
    }
});