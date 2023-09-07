"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert_1 = require("oak-domain/lib/utils/assert");
var utils_1 = require("../filter2/utils");
exports.default = OakComponent({
    entity: function () {
        var entity = this.props.entity;
        return entity;
    },
    isList: true,
    data: {
        isExpandContent: false,
        open: false,
        columnsMp: [],
        moreColumnsMp: [],
    },
    properties: {
        entity: '',
        columns: [],
    },
    lifetimes: {
        ready: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var columns, count, columnsMp, moreColumnsMp;
                return tslib_1.__generator(this, function (_a) {
                    columns = this.props.columns;
                    count = 0;
                    columns === null || columns === void 0 ? void 0 : columns.forEach(function (ele) {
                        if (ele.op === '$text') {
                            count++;
                        }
                    });
                    (0, assert_1.assert)(!(count > 1), '仅支持一项进行全文检索');
                    // 小程序最多可显示三个过滤器，剩下的放在折叠面板
                    if (process.env.OAK_PLATFORM === 'wechatMp') {
                        columnsMp = columns === null || columns === void 0 ? void 0 : columns.slice(0, 3);
                        moreColumnsMp = columns === null || columns === void 0 ? void 0 : columns.slice(3);
                        this.setState({
                            columnsMp: columnsMp,
                            moreColumnsMp: moreColumnsMp,
                        });
                    }
                    return [2 /*return*/];
                });
            });
        }
    },
    methods: {
        getNamedFilters: function () {
            if (this.state.oakFullpath) {
                var namedFilters = this.features.runningTree.getNamedFilters(this.state.oakFullpath);
                return namedFilters;
            }
            return [];
        },
        toggleExpand: function () {
            this.setState({
                isExpandContent: !this.state.isExpandContent,
            });
        },
        resetFiltersMp: function () {
            var _this = this;
            var columns = this.props.columns;
            var filterNames = columns === null || columns === void 0 ? void 0 : columns.map(function (ele) { return (0, utils_1.getFilterName)(ele); });
            if (filterNames && filterNames.length) {
                filterNames.forEach(function (ele) {
                    return _this.removeNamedFilterByName(ele);
                });
                this.refresh();
            }
        },
        confirmSearchMp: function () {
            this.refresh();
        }
    },
});
