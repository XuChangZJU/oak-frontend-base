"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
var usefulFn_1 = require("../../utils/usefulFn");
exports.default = OakComponent({
    isList: false,
    entity: function () {
        return this.props.entity;
    },
    properties: {
        entity: String,
        attributes: Array,
        data: Object,
        children: Object,
    },
    formData: function () {
        var data = this.props.data;
        var transformer = this.state.transformer;
        var renderData = transformer(data);
        return {
            renderData: renderData,
        };
    },
    data: {
        transformer: (function () { return []; }),
        mtoPickerDict: {},
        mtoData: {},
        pickerEntity: undefined,
        pickerProjection: {},
        pickerFilter: {},
        pickerTitleFn: undefined,
        pickerTitleLabel: '',
        pickerAttr: '',
        pickerDialogTitle: '',
    },
    listeners: {
        data: function () {
            this.reRender();
        },
    },
    lifetimes: {
        attached: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, attributes, entity, schema, _b, transformer, mtoPickerDict;
                var _this = this;
                return tslib_1.__generator(this, function (_c) {
                    _a = this.props, attributes = _a.attributes, entity = _a.entity;
                    schema = this.features.cache.getSchema();
                    _b = (0, usefulFn_1.analyzeDataUpsertTransformer)(schema, entity, attributes, function (k, params) { return _this.t(k, params); }), transformer = _b.transformer, mtoPickerDict = _b.mtoPickerDict;
                    this.setState({
                        transformer: transformer,
                        mtoPickerDict: mtoPickerDict,
                    });
                    return [2 /*return*/];
                });
            });
        },
        ready: function () {
            var mtoPickerDict = this.state.mtoPickerDict;
            for (var k in mtoPickerDict) {
                var _a = mtoPickerDict[k], mode = _a.mode, entity = _a.entity, projection = _a.projection, filter = _a.filter, count = _a.count, title = _a.title;
                if (mode === 'radio' || mode === 'select') {
                    // radio的要先取数据出来
                    (0, assert_1.default)(typeof count === 'number' && count <= 10, 'radio类型的外键选择，总数必须小于10');
                    this.refreshData(k);
                }
            }
        }
    },
    methods: {
        refreshData: function (attr) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var data;
                var _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.fetchData(attr)];
                        case 1:
                            data = _b.sent();
                            this.setState({
                                mtoData: Object.assign({}, this.state.mtoData, (_a = {},
                                    _a[attr] = data,
                                    _a))
                            });
                            return [2 /*return*/];
                    }
                });
            });
        },
        fetchData: function (attr) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, entity, projection, filter, count, title, entity2, proj, filter2, data, data2;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = this.state.mtoPickerDict[attr], entity = _a.entity, projection = _a.projection, filter = _a.filter, count = _a.count, title = _a.title;
                            entity2 = attr === 'entityId' ? this.props.data.entity : entity;
                            proj = typeof projection === 'function' ? projection() : projection;
                            filter2 = typeof filter === 'function' ? filter() : filter;
                            return [4 /*yield*/, this.features.cache.refresh(entity2, {
                                    data: proj,
                                    filter: filter2,
                                    indexFrom: 0,
                                    count: count,
                                })];
                        case 1:
                            data = (_b.sent()).data;
                            data2 = data.map(function (ele) { return ({
                                id: ele.id,
                                title: title(ele),
                            }); });
                            return [2 /*return*/, data2];
                    }
                });
            });
        },
        openPicker: function (attr) {
            var _a = this.state.mtoPickerDict[attr], entity = _a.entity, projection = _a.projection, filter = _a.filter, count = _a.count, title = _a.title, titleLabel = _a.titleLabel;
            var entity2 = attr === 'entityId' ? this.props.data.entity : entity;
            var proj = typeof projection === 'function' ? projection() : projection;
            var filter2 = typeof filter === 'function' ? filter() : filter;
            this.setState({
                pickerEntity: entity2,
                pickerProjection: proj,
                pickerFilter: filter2,
                pickerTitleFn: title,
                pickerTitleLabel: titleLabel,
                pickerAttr: attr,
                pickerDialogTitle: "\u9009\u62E9".concat(this.t("".concat(entity2, ":name"))),
            });
        },
        closePicker: function () {
            this.setState({
                pickerEntity: undefined,
            });
        }
    }
});
