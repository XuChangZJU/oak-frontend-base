"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const usefulFn_1 = require("../../utils/usefulFn");
const assert_1 = require("oak-domain/lib/utils/assert");
exports.default = OakComponent({
    isList: false,
    properties: {
        entity: '',
        title: '',
        bordered: false,
        layout: 'horizontal',
        attributes: [],
        data: {},
        column: 3,
    },
    formData() {
        const { data, attributes } = this.props;
        const { transformer } = this.state;
        const renderData = transformer(data);
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
        transformer: (() => []),
        judgeAttributes: [],
    },
    lifetimes: {
        ready() {
            const { attributes, entity } = this.props;
            const schema = this.features.cache.getSchema();
            (0, assert_1.assert)(attributes);
            const judgeAttributes = (0, usefulFn_1.translateAttributes)(schema, entity, attributes);
            const ttt = this.t.bind(this);
            const transformer = (0, usefulFn_1.makeDataTransformer)(schema, entity, attributes, ttt);
            this.setState({
                transformer,
                judgeAttributes,
            });
        },
    },
    methods: {
        decodeTitle(entity, attr) {
            if (attr === ('$$createAt$$' || '$$updateAt$$')) {
                return this.t(`common::${attr}`);
            }
            return this.t(`${entity}:attr.${attr}`);
        },
        preview(event) {
            let currentUrl = event.currentTarget.dataset.src;
            let urlList = event.currentTarget.dataset.list;
            wx.previewImage({
                current: currentUrl,
                urls: urlList, // 需要预览的图片http链接列表
            });
        },
    },
});
