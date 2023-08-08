import {
    DataType,
    DataTypeParams,
} from 'oak-domain/lib/types/schema/DataTypes';
import {
    DataTransformer,
    ED,
    OakAbsAttrDef,
    OakAbsAttrUpsertDef,
    ColumnMapType,
} from '../../types/AbstractComponent';
import { makeDataTransformer } from '../../utils/usefulFn';
import { ReactComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ColorDict } from 'oak-domain/lib/types/Style';
import { EntityDict } from 'oak-domain/lib/types/Entity';
type AttrRender = {
    label: string;
    value: any;
    type: DataType;
    params: DataTypeParams;
    width?: 1 | 2 | 3 | 4;
    ref?: string;
};
const DEFAULT_COLUMN_MAP: ColumnMapType = {
    xxl: 4,
    xl: 4,
    lg: 4,
    md: 3,
    sm: 2,
    xs: 1,
};
export default OakComponent({
    isList: false,
    properties: {
        entity: '' as keyof ED,
        title: '',
        bordered: false,
        layout: 'horizontal' as 'horizontal' | 'vertical',
        attributes: [] as OakAbsAttrDef[],
        data: {} as ED[keyof ED]['Schema'],
        column: DEFAULT_COLUMN_MAP,
    },
    formData() {
        const { data } = this.props;
        const { transformer } = this.state;
        const renderData = transformer(data!);
        const colorDict = this.features.style.getColorDict();
        return {
            renderData,
            colorDict,
        };
    },
    listeners: {
        data(prev, next) {
            if (prev.data !== next.data) {
                this.reRender();
            }
        },
        // data() {
        //     this.reRender();
        // },
        // attributes() {
        //     this.reRender();
        // },
    },
    data: {
        transformer: (() => []) as DataTransformer,
    },
    lifetimes: {
        ready() {
            const { attributes, entity } = this.props;
            const schema = this.features.cache.getSchema();
            const transformer = makeDataTransformer(
                schema,
                entity!,
                attributes!
                // (k, params) => this.t(k, params)
            );
            this.setState({
                transformer,
            });
        },
    },
    methods: {
        decodeTitle(entity: string, attr: string) {
            if (attr === ('$$createAt$$' || '$$updateAt$$')) {
                return this.t(`common:${attr}`);
            }
            return this.t(`${entity}:attr.${attr}`);
        },
        preview(event: {
            currentTarget: { dataset: { src: string; list: string[] } };
        }) {
            let currentUrl = event.currentTarget.dataset.src;
            let urlList = event.currentTarget.dataset.list;
            wx.previewImage({
                current: currentUrl, // 当前显示图片的http链接
                urls: urlList, // 需要预览的图片http链接列表
            });
        },
    },
}) as <ED2 extends ED, T2 extends keyof ED2>(
    props: ReactComponentProps<
        ED2,
        T2,
        false,
        {
            column?: ColumnMapType;
            entity: T2;
            attributes: OakAbsAttrDef[];
            data: Partial<ED2[T2]['Schema']>;
            title?: string;
            bordered?: boolean;
            layout?: 'horizontal' | 'vertical',
        }
    >
) => React.ReactElement;
