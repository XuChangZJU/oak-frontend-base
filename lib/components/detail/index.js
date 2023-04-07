"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var usefulFn_1 = require("../../utils/usefulFn");
var DEFAULT_COLUMN_MAP = {
    xxl: 4,
    xl: 4,
    lg: 4,
    md: 3,
    sm: 2,
    xs: 1,
};
exports.default = OakComponent({
    isList: false,
    properties: {
        entity: '',
        attributes: [],
        data: {},
        column: DEFAULT_COLUMN_MAP,
    },
    formData: function () {
        var data = this.props.data;
        var transformer = this.state.transformer;
        var renderData = transformer(data);
        var colorDict = this.features.style.getColorDict();
        return {
            renderData: renderData,
            colorDict: colorDict,
        };
    },
    listeners: {
        data: function (prev, next) {
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
        transformer: (function () { return []; }),
    },
    lifetimes: {
        ready: function () {
            var _a = this.props, attributes = _a.attributes, entity = _a.entity;
            var schema = this.features.cache.getSchema();
            var transformer = (0, usefulFn_1.makeDataTransformer)(schema, entity, attributes
            // (k, params) => this.t(k, params)
            );
            this.setState({
                transformer: transformer,
            });
        },
    },
    methods: {
        decodeTitle: function (entity, attr) {
            if (attr === ('$$createAt$$' || '$$updateAt$$')) {
                return this.t("common:".concat(attr));
            }
            return this.t("".concat(entity, ":attr.").concat(attr));
        },
        preview: function (event) {
            var currentUrl = event.currentTarget.dataset.src;
            var urlList = event.currentTarget.dataset.list;
            wx.previewImage({
                current: currentUrl,
                urls: urlList, // 需要预览的图片http链接列表
            });
        },
    },
});
