import { OakAbsAttrDef, OakAbsNativeAttrDef, ColumnDefProps } from '../../types/AbstractComponent';
import { analyzeAttrDefForTable } from '../../utils/usefulFn';
import assert from 'assert';

export default OakComponent({
    isList: false,
    properties: {
        entity: String,
        extraActions: Array,
        disabledOp: Boolean,
        attributes: Array,
        data: Array,
        loading: Boolean,
        tablePagination: Object,
    },
    data: {
    },
    lifetimes: {
        async ready() {
            const { attributes, entity } = this.props;
            const schema = this.features.cache.getSchema();
            const colorDict = this.features.style.getColorDict();
            assert(!!entity, 'list属性entity不能为空');
            assert(!!attributes, 'list属性attributes不能为空');
            const { converter, columnDef } = analyzeAttrDefForTable(schema, entity!, attributes!, (k, params) => this.t(k, params));
            this.setState({
                converter,
                columns: columnDef,
                colorDict,
                schema,
            })
        }
    }
});