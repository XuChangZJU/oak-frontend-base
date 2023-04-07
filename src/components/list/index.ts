import { CardDef, ED, OakAbsAttrDef } from '../../types/AbstractComponent';
import { analyzeAttrMobileForCard } from '../../utils/usefulFn';
import assert from 'assert';
import { TableProps } from 'antd';
import { Pagination } from '../../types/Pagination';

export default OakComponent({
    isList: false,
    properties: {
        entity: '' as keyof ED,
        extraActions: [] as string[],
        onAction: (() => undefined) as Function,
        disabledOp: false,
        attributes: [] as OakAbsAttrDef[],
        attributesMb: {} as CardDef,
        data: [] as ED[keyof ED]['Schema'][],
        loading: false,
        tablePagination: {} as Pagination,
        rowSelection: {} as TableProps<any[]>['rowSelection'],
        scroll: {} as TableProps<any[]>['scroll'],
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
            if (attributesMb) {
                const converter = analyzeAttrMobileForCard(schema, entity, (k, params) => this.t(k, params), attributesMb as CardDef, colorDict);
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
                record: row,
                action,
                cascadeAction,
            })
        },
    }
});