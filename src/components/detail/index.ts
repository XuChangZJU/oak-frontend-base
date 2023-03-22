import {
    DataType,
    DataTypeParams,
} from 'oak-domain/lib/types/schema/DataTypes';
import { DataTransformer } from '../../types/AbstractComponent';
import { makeDataTransformer } from '../../utils/usefulFn';
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
export type ColSpanType = 1 | 2 | 3 | 4;
type ColumnMapType = {
    xxl: ColSpanType;
    xl: ColSpanType;
    lg: ColSpanType;
    md: ColSpanType;
    sm: ColSpanType;
    xs: ColSpanType;
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
        entity: String,
        attributes: Array,
        data: Object,
        column: {
            type: Object,
            value: DEFAULT_COLUMN_MAP,
        },
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
                attributes!,
                (k, params) => this.t(k, params)
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
});
