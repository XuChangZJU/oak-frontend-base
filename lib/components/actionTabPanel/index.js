"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
exports.default = OakComponent({
    isList: false,
    data: {
        slideWidth: 0,
        slideLeft: 0,
        slideShow: false,
        commonAction: [
            'create',
            'update',
            'remove',
            'confirm',
            'cancel',
            'grant',
            'revoke',
        ],
    },
    properties: {
        entity: '',
        items: [],
        rows: 2,
        column: 5,
        mode: 'text',
    },
    lifetimes: {
        ready: function () {
            if (process.env.OAK_PLATFORM === 'wechatMp') {
                this.getItemsByMp();
            }
        },
    },
    listeners: {
        items: function (prev, next) {
            var _a, _b;
            if (process.env.OAK_PLATFORM === 'wechatMp') {
                if (prev.items !== next.items ||
                    ((_a = prev.items) === null || _a === void 0 ? void 0 : _a.length) !== ((_b = next.items) === null || _b === void 0 ? void 0 : _b.length)) {
                    this.getItemsByMp();
                }
            }
        },
    },
    methods: {
        getActionName: function (action) {
            var entity = this.props.entity;
            var commonAction = this.state.commonAction;
            var text = '';
            if (action) {
                if (commonAction.includes(action)) {
                    text = this.t("common::action.".concat(action));
                }
                else if (entity) {
                    text = this.t("".concat(entity, ":action.").concat(action));
                }
            }
            return text;
        },
        getAlertOptions: function (item) {
            var alertContent = '';
            if (item.action) {
                var text = this.getActionName(item.action);
                alertContent = "\u786E\u8BA4".concat(text, "\u8BE5\u6570\u636E");
            }
            return {
                title: item.alertTitle || '温馨提示',
                content: item.alertContent || alertContent,
                okText: item.confirmText || '确定',
                cancelText: item.cancelText || '取消',
            };
        },
        linconfirm: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var selectItem, detail;
                return tslib_1.__generator(this, function (_a) {
                    selectItem = this.state.selectItem;
                    detail = {
                        item: selectItem,
                    };
                    if (selectItem.click) {
                        this.triggerEvent('click', detail);
                        return [2 /*return*/];
                    }
                    return [2 /*return*/];
                });
            });
        },
        lincancel: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    this.setState({
                        selectItem: '',
                    });
                    return [2 /*return*/];
                });
            });
        },
        handleClick: function (e) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var item, dialog, _a, title, content, okText, cancelText, detail;
                return tslib_1.__generator(this, function (_b) {
                    item = e.currentTarget.dataset.item;
                    if (item.alerted) {
                        dialog = this.selectComponent('#my-action-tab-dialog');
                        _a = this.getAlertOptions(item), title = _a.title, content = _a.content, okText = _a.okText, cancelText = _a.cancelText;
                        dialog.linShow({
                            type: 'confirm',
                            title: title,
                            content: content,
                            'confirm-text': okText,
                            'cancel-text': cancelText,
                        });
                        this.setState({
                            selectItem: item,
                        });
                        return [2 /*return*/];
                    }
                    detail = {
                        item: item,
                    };
                    if (item.click) {
                        this.triggerEvent('click', detail);
                        return [2 /*return*/];
                    }
                    return [2 /*return*/];
                });
            });
        },
        scroll: function (e) {
            this.setData({
                slideLeft: e.detail.scrollLeft * this.state.slideRatio,
            });
        },
        getItemsByMp: function () {
            var _this = this;
            var _a = this.state, items = _a.items, rows = _a.rows, column = _a.column;
            var items2 = items
                .filter(function (ele) {
                var show = ele.show;
                var showResult = ele.hasOwnProperty('show') ? show : true;
                return showResult;
            })
                .map(function (ele) {
                var label = ele.label, action = ele.action;
                var text;
                if (label) {
                    text = label;
                }
                else {
                    text = _this.getActionName(action);
                }
                return Object.assign(ele, {
                    text: text,
                });
            });
            var count = rows * column;
            var num = 1;
            if (items2.length > 0) {
                num =
                    items2.length % count !== 0
                        ? parseInt((items2.length / count).toString(), 10) + 1
                        : items2.length / count;
            }
            var tabNums = [];
            for (var i = 1; i <= num; i++) {
                tabNums.push(i);
            }
            var res = wx.getSystemInfoSync();
            var _totalLength = tabNums.length * 750; //分类列表总长度
            var _ratio = (100 / _totalLength) * (750 / res.windowWidth); //滚动列表长度与滑条长度比例
            var _showLength = (750 / _totalLength) * 100; //当前显示红色滑条的长度(保留两位小数)
            this.setState({
                tabNums: tabNums,
                slideWidth: _showLength,
                totalLength: _totalLength,
                slideShow: num > 1,
                slideRatio: _ratio,
                newItems: items2,
                count: count,
            });
        },
    },
});
