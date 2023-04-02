import assert from 'assert';
import { ED } from '../../types/AbstractComponent';
import { DataUpsertTransformer, OakAbsRefAttrPickerDef } from '../../types/AbstractComponent';
import { analyzeDataUpsertTransformer } from '../../utils/usefulFn';

export default OakComponent({
    isList: false,
    entity() {
        return this.props.entity as any;
    },
    properties: {
        helps: Object,      // Record<string, string>;
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
        transformer: (() => []) as DataUpsertTransformer<ED>,
    },
    listeners: {
        data() {
            this.reRender();
        },
    },
    lifetimes: {
        async attached() {
            const { attributes, entity } = this.props;
            const schema = this.features.cache.getSchema();

            const transformer = analyzeDataUpsertTransformer<ED>(schema, entity!, attributes!, (k, params) => this.t(k, params));
            this.setState({
                transformer,
            });
        },
    },
});