"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
exports.default = OakComponent({
    isList: false,
    properties: {
        entity: '',
        items: [],
        mode: 'cell',
        column: 3,
    },
    data: {
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
                var _a, item, type, popover, dialog, _b, title, content, okText, cancelText, detail;
                return tslib_1.__generator(this, function (_c) {
                    _a = e.currentTarget.dataset, item = _a.item, type = _a.type;
                    if (type === 'popover') {
                        popover = this.selectComponent('#popover');
                        popover.onHide();
                    }
                    if (item.alerted) {
                        dialog = this.selectComponent('#my-action-btn-dialog');
                        _b = this.getAlertOptions(item), title = _b.title, content = _b.content, okText = _b.okText, cancelText = _b.cancelText;
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
        getItemsByMp: function () {
            var _this = this;
            var _a = this.state, oakLegalActions = _a.oakLegalActions, items = _a.items, column = _a.column;
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
            var newItems = items2;
            var moreItems = [];
            if (column && items2.length > column) {
                newItems = tslib_1.__spreadArray([], tslib_1.__read(items2), false).splice(0, column);
                moreItems = tslib_1.__spreadArray([], tslib_1.__read(items2), false).splice(column, items2.length);
            }
            this.setState({
                newItems: newItems,
                moreItems: moreItems,
            });
        },
        handleMoreClick: function (e) {
            // 获取按钮元素的坐标信息
            var id = e.currentTarget.id;
            // let scrollTop = 0;
            // wx.createSelectorQuery()
            //     .selectViewport()
            //     .scrollOffset(function (res) {
            //         scrollTop = res.scrollTop;
            //     })
            //     .exec();
            var popover = this.selectComponent('#popover');
            wx.createSelectorQuery()
                .in(this)
                .select('#' + id)
                .boundingClientRect(function (res) {
                popover.onDisplay(res);
            })
                .exec();
        },
    },
});
