"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
exports.default = OakComponent({
    isList: false,
    entity: function () {
        return this.props.pickerDef.entity;
    },
    properties: {
        multiple: Boolean,
        entityId: String,
        entityIds: Array,
        pickerDef: Object, // OakAbsRefAttrPickerDef
    },
    formData: function () {
        var _a = this.props, multiple = _a.multiple, entityIds = _a.entityIds, entityId = _a.entityId, pickerDef = _a.pickerDef;
        var _b = pickerDef, entity = _b.entity, projection = _b.projection, title = _b.title;
        if (multiple) {
            var rows = entityIds && this.features.cache.get(entity, {
                data: typeof projection === 'function' ? projection() : projection,
                filter: {
                    id: {
                        $in: entityIds,
                    },
                },
            });
            var renderValue_1 = rows && rows.map(function (row) { return title(row); }).join(',');
            return {
                renderValue: renderValue_1,
            };
        }
        var row = entityId && this.features.cache.get(entity, {
            data: typeof projection === 'function' ? projection() : projection,
            filter: {
                id: entityId,
            },
        })[0];
        var renderValue = row && title(row);
        return {
            renderValue: renderValue,
        };
    },
    data: {
        data: undefined,
        pickerEntity: undefined,
        pickerProjection: {},
        pickerFilter: {},
        pickerTitleFn: undefined,
        pickerTitleLabel: '',
        pickerAttr: '',
        pickerDialogTitle: '',
    },
    listeners: {
        entityId: function () {
            this.reRender();
        },
        entityIds: function () {
            this.reRender();
        }
    },
    lifetimes: {
        ready: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    this.refreshData();
                    return [2 /*return*/];
                });
            });
        }
    },
    methods: {
        refreshData: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, pickerDef, multiple, _b, mode, entity, projection, filter, count, title, proj, filter2, data, data2;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _a = this.props, pickerDef = _a.pickerDef, multiple = _a.multiple;
                            _b = pickerDef, mode = _b.mode, entity = _b.entity, projection = _b.projection, filter = _b.filter, count = _b.count, title = _b.title;
                            if (mode === 'radio') {
                                // radio的要先取数据出来
                                (0, assert_1.default)(typeof count === 'number' && count <= 5, 'radio类型的外键选择，总数必须小于5');
                            }
                            else if (mode === 'select') {
                                // select也先取（可以点击再取，但这样初始状态不好渲染）
                                (0, assert_1.default)(!multiple, '选择为多项时不支持multiple');
                                (0, assert_1.default)(typeof count === 'number' && count <= 20, 'radio类型的外键选择，总数必须小于20');
                            }
                            else {
                                return [2 /*return*/];
                            }
                            proj = typeof projection === 'function' ? projection() : projection;
                            filter2 = typeof filter === 'function' ? filter() : filter;
                            return [4 /*yield*/, this.features.cache.refresh(entity, {
                                    data: proj,
                                    filter: filter2,
                                    indexFrom: 0,
                                    count: count,
                                })];
                        case 1:
                            data = (_c.sent()).data;
                            data2 = data.map(function (ele) { return ({
                                id: ele.id,
                                title: title(ele),
                            }); });
                            this.setState({
                                data: data2,
                            });
                            return [2 /*return*/];
                    }
                });
            });
        },
        openPicker: function (attr) {
            var _a = this.state.mtoPickerDict[attr], entity = _a.entity, projection = _a.projection, filter = _a.filter, title = _a.title, titleLabel = _a.titleLabel;
            var proj = typeof projection === 'function' ? projection() : projection;
            var filter2 = typeof filter === 'function' ? filter() : filter;
            this.setState({
                pickerEntity: entity,
                pickerProjection: proj,
                pickerFilter: filter2,
                pickerTitleFn: title,
                pickerTitleLabel: titleLabel,
                pickerAttr: attr,
                pickerDialogTitle: "\u9009\u62E9".concat(this.t("".concat(entity, ":name"))),
            });
        },
        closePicker: function () {
            this.setState({
                pickerEntity: undefined,
            });
        }
    }
});
