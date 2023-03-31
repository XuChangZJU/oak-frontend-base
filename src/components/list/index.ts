import { OakAbsAttrDef, OakAbsNativeAttrDef, ColumnDefProps, CardDef } from '../../types/AbstractComponent';
import { analyzeAttrDefForTable, analyzeAttrMobileForCard } from '../../utils/usefulFn';
import assert from 'assert';

export default OakComponent({
    isList: false,
    properties: {
        entity: String,
        extraActions: Array,
        onAction: Function,
        disabledOp: Boolean,
        attributes: Array,
        attributesMb: Object,
        data: Array,
        loading: Boolean,
        tablePagination: Object,
        rowSelection: Object,
        scroll: Object,
    },
    formData({ props }) {
        const { converter } = this.state;
        const { data } = props;
        if (converter) {
            const mobileData = converter(data!);
            return {
                mobileData,
            }
        }
        return {}
    },
    data: {
        converter: ((data: any) => <any>[])
    },
    listeners: {
        data() {
            this.reRender();
        },
    },
    lifetimes: {
        async ready() {
            // 因为部分i18json数据请求较慢，会导致converter，columnDef解析出错
            const { attributes, entity, data, attributesMb } = this.props;
            const schema = this.features.cache.getSchema();
            const colorDict = this.features.style.getColorDict();
            assert(!!data, 'data不能为空');
            assert(!!entity, 'list属性entity不能为空');
            if (attributes && attributes.length) {
                const { columnDef } = analyzeAttrDefForTable(schema, entity!, attributes!, (k, params) => this.t(k, params), attributesMb as CardDef);
                this.setState({
                    columns: columnDef,
                    colorDict,
                });
            }
            if (attributesMb) {
                const converter = analyzeAttrMobileForCard(schema, entity!, (k, params) => this.t(k, params), attributesMb as CardDef, colorDict);
                this.setState({
                    converter,
                })
            }
        }
    },
    methods: {
        onActionMp(e: WechatMiniprogram.TouchEvent) {
            const { onAction } = this.props;
            const { action, cascadeAction } = e.detail;
            const { row } = e.currentTarget.dataset;
            this.triggerEvent('onAction', {
                row,
                action,
                cascadeAction,
            })
        }
    }
});