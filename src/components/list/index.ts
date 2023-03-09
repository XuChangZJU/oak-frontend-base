import { OakAbsAttrDef, OakAbsNativeAttrDef, OakAbsFullAttrDef } from '../../types/AbstractComponent';
import { analyzeAttrDefForTable } from '../../utils/usefulFn';
type RenderObj = {
    label: string;
    value: string;
    type: string;
}

export default OakComponent({
    isList: false,
    properties: {
        entity: String,
        attributes: Array,
        data: Array,
    },
    data: {
        transformAttrFn: (attributes: OakAbsAttrDef[]): RenderObj[] => {

            return [];
        }
    },
    formData({ props, features }) {
        const { data } = props;
        const { converter } = this.state;
        const columns = converter(data);
        return {
            columns,
        }
    },
    lifetimes: {
        async ready() {
            const { attributes, entity } = this.props;
            const schema = this.features.cache.getSchema();
            const { converter, columnDef } = analyzeAttrDefForTable(schema, entity!, attributes!, (k, params) => this.t(k, params));
            this.setState({
                converter,
            })
        }
    }
});