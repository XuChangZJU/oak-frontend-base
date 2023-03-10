import { OakAbsAttrDef, OakAbsNativeAttrDef, OakAbsFullAttrDef } from '../../types/AbstractComponent';
import { analyzeAttrDefForTable } from '../../utils/usefulFn';

export default OakComponent({
    isList: false,
    properties: {
        entity: String,
        disabledOp: Boolean,
        attributes: Array,
        data: Array,
        tablePagination: Object,
    },
    data: {
    },
    formData({ props, features }) {
        const { data } = props;
        const { converter, columnDef } = this.state;
        const columns = columnDef;
        const colorDict = features.style.getColorDict();
        return {
            columns,
            mobileData: converter(data),
            colorDict,
        }
    },
    lifetimes: {
        async ready() {
            const { attributes, entity } = this.props;
            const schema = this.features.cache.getSchema();
            const { converter, columnDef } = analyzeAttrDefForTable(schema, entity!, attributes!, (k, params) => this.t(k, params));
            this.setState({
                converter,
                columnDef,
            })
        }
    }
});