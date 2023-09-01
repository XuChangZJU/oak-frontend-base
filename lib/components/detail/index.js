"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var usefulFn_1 = require("../../utils/usefulFn");
var assert_1 = tslib_1.__importDefault(require("assert"));
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
    formData: function () {
        var _a = this.props, data = _a.data, attributes = _a.attributes;
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
        judgeAttributes: [],
    },
    lifetimes: {
        ready: function () {
            var _a = this.props, attributes = _a.attributes, entity = _a.entity;
            var schema = this.features.cache.getSchema();
            (0, assert_1.default)(attributes);
            var judgeAttributes = (0, usefulFn_1.translateAttributes)(schema, entity, attributes);
            var ttt = this.t.bind(this);
            var transformer = (0, usefulFn_1.makeDataTransformer)(schema, entity, attributes, ttt);
            this.setState({
                transformer: transformer,
                judgeAttributes: judgeAttributes,
            });
        },
    },
    methods: {
        decodeTitle: function (entity, attr) {
            if (attr === ('$$createAt$$' || '$$updateAt$$')) {
                return this.t("common::".concat(attr));
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
