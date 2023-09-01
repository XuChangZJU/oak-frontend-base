import { CardDef, ED, OakAbsAttrDef, onActionFnDef, OakExtraActionProps, ListButtonProps, OakAbsAttrJudgeDef } from '../../types/AbstractComponent';
import { analyzeAttrMobileForCard, translateAttributes } from '../../utils/usefulFn';
import assert from 'assert';
import { TableProps, PaginationProps } from 'antd';
import { RowWithActions, ReactComponentProps } from '../../types/Page';

export default OakComponent({
    isList: false,
    properties: {
        entity: '' as keyof ED,
        extraActions: [] as OakExtraActionProps[],
        onAction: (() => undefined) as Function,
        disabledOp: false,
        attributes: [] as OakAbsAttrDef[],
        data: [] as RowWithActions<ED, keyof ED>[],
        loading: false,
        tablePagination: {} as TableProps<
            RowWithActions<ED, keyof ED>[]
        >['pagination'],
        rowSelection: {} as {
            type: 'checkbox' | 'radio';
            selectedRowKeys?: string[];
            onChange: (
                selectedRowKeys: string[],
                selectedRows: RowWithActions<ED, keyof ED>[],
                info?: { type: 'single' | 'multiple' | 'none' }
            ) => void;
        },
        hideHeader: false,
    },
    formData({ props }) {
        const { converter } = this.state;
        const { data } = props;
        if (converter) {
            const mobileData = converter(data!);
            return {
                mobileData,
            };
        }
        return {};
    },
    data: {
        converter: (data: any) => <any>[],
        judgeAttributes: [] as OakAbsAttrJudgeDef[],
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
            const converter = analyzeAttrMobileForCard(
                schema,
                entity,
                ttt,
                attributes!,
            );
            const judgeAttributes = translateAttributes(schema, entity, attributes!);
            this.setState({
                converter,
                schema,
                colorDict,
                judgeAttributes,
            });
        },
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
            });
        },
    },
}) as <ED2 extends ED, T2 extends keyof ED2>(
    props: ReactComponentProps<
        ED2,
        T2,
        false,
        {
            entity: T2;
            extraActions: OakExtraActionProps[];
            onAction: onActionFnDef;
            disabledOp: boolean;
            attributes: OakAbsAttrDef[];
            data: RowWithActions<ED2, T2>[];
            loading: boolean;
            tablePagination?: TableProps<
                RowWithActions<ED2, T2>[]
            >['pagination'];
            rowSelection?: {
                type: 'checkbox' | 'radio';
                selectedRowKeys?: string[];
                onChange: (
                    selectedRowKeys: string[],
                    row: RowWithActions<ED2, T2>[],
                    info?: { type: 'single' | 'multiple' | 'none' }
                ) => void;
            };
            hideHeader: boolean;
        }
    >
) => React.ReactElement;