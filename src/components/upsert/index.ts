import { DataTransformer } from '../../types/AbstractComponent';
import { makeDataTransformer } from '../../utils/usefulFn';

export default OakComponent({
    isList: false,
    entity() {
        return this.props.entity as any;
    },
    properties: {
        entity: String,
        attributes: Array,
        data: Object,
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
        transformer: (() => []) as DataTransformer,
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
            
            const transformer = makeDataTransformer(schema, entity!, attributes!, (k, params) => this.t(k, params));
            this.setState({
                transformer,
            });
        }
    }
});