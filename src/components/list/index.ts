import { OakAbsAttrDef, OakAbsNativeAttrDef, ColumnDefProps } from '../../types/AbstractComponent';
import { analyzeAttrDefForTable } from '../../utils/usefulFn';
import assert from 'assert';

export default OakComponent({
    isList: false,
    properties: {
        entity: String,
        extraActions: Array,
        onAction: Object,
        disabledOp: Boolean,
        attributes: Array,
        data: Array,
        loading: Boolean,
        tablePagination: Object,
        rowSelection: Object,
    },
    formData({ props }) {
        // 因为部分i18json数据请求较慢，会导致converter，columnDef解析出错
        const { attributes, entity } = this.props;
        const schema = this.features.cache.getSchema();
        const colorDict = this.features.style.getColorDict();
        assert(!!entity, 'list属性entity不能为空');
        assert(!!attributes, 'list属性attributes不能为空');
        const { converter, columnDef } = analyzeAttrDefForTable(schema, entity!, attributes!, (k, params) => this.t(k, params));
        return {
            converter,
            columns: columnDef,
            colorDict,
            schema,
        }
    },
    data: {
    },
    listeners: {
    },
    lifetimes: {
    }
});