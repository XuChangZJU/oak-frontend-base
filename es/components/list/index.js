import { analyzeAttrMobileForCard, translateAttributes } from '../../utils/usefulFn';
import { assert } from 'oak-domain/lib/utils/assert';
export default OakComponent({
    isList: false,
    properties: {
        entity: '',
        extraActions: [],
        onAction: (() => { }),
        disabledOp: false,
        attributes: [],
        data: [],
        loading: false,
        tablePagination: {},
        rowSelection: {},
        hideHeader: false,
    },
    formData({ props }) {
        const { converter } = this.state;
        const { data } = props;
        if (converter) {
            const mobileData = converter(data);
            return {
                mobileData,
            };
        }
        return {};
    },
    data: {
        converter: (data) => [],
        judgeAttributes: [],
    },
    listeners: {
        data() {
            this.reRender();
        },
    },
    lifetimes: {
        async ready() {
            // 因为部分i18json数据请求较慢，会导致converter，columnDef解析出错
            const { attributes, entity, data } = this.props;
            const schema = this.features.cache.getSchema();
            const colorDict = this.features.style.getColorDict();
            assert(!!data, 'data不能为空');
            assert(!!entity, 'list属性entity不能为空');
            // assert(attributes?.length, 'attributes不能为空');
            const ttt = this.t.bind(this);
            const converter = analyzeAttrMobileForCard(schema, entity, ttt, attributes);
            const judgeAttributes = translateAttributes(schema, entity, attributes);
            this.setState({
                converter,
                schema,
                colorDict,
                judgeAttributes,
            });
        },
    },
    methods: {
        onActionMp(e) {
            const { onAction } = this.props;
            const { action, cascadeAction } = e.detail;
            const { row } = e.currentTarget.dataset;
            this.triggerEvent('onAction', {
                record: row,
                action,
                cascadeAction,
            });
        },
    },
});
