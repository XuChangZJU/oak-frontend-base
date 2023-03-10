"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var web_module_less_1 = tslib_1.__importDefault(require("./web.module.less"));
var confirm = antd_1.Modal.confirm;
function ItemComponent(props) {
    var type = props.type, buttonProps = props.buttonProps, render = props.render, onClick = props.onClick, text = props.text;
    if (type === 'button') {
        return ((0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({}, buttonProps, { onClick: onClick }, { children: text })));
    }
    if (render) {
        return (0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ onClick: onClick }, { children: render }));
    }
    return (0, jsx_runtime_1.jsx)("a", tslib_1.__assign({ onClick: onClick }, { children: text }));
}
function Render(props) {
    var _this = this;
    var methods = props.methods, data = props.data;
    var t = methods.t, getActionName = methods.getActionName, getAlertOptions = methods.getAlertOptions;
    var items = data.items, spaceProps = data.spaceProps, entity = data.entity, _a = data.mode, mode = _a === void 0 ? 'cell' : _a, column = data.column;
    var getItems = function () {
        var items2 = items
            .filter(function (ele) {
            var show = ele.show;
            var showResult = ele.hasOwnProperty('show') ? show : true;
            return showResult;
        })
            .map(function (ele, index) {
            var label = ele.label, action = ele.action;
            var text = '';
            if (label) {
                text = label;
            }
            else {
                text = getActionName(action);
            }
            var onClick = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    if (ele.onClick) {
                        ele.onClick(ele);
                        return [2 /*return*/];
                    }
                    return [2 /*return*/];
                });
            }); };
            if (ele.alerted) {
                onClick = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var _a, title, content, okText, cancelText;
                    var _this = this;
                    return tslib_1.__generator(this, function (_b) {
                        _a = getAlertOptions(ele), title = _a.title, content = _a.content, okText = _a.okText, cancelText = _a.cancelText;
                        confirm({
                            title: title,
                            content: content,
                            okText: okText,
                            cancelText: cancelText,
                            onOk: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                return tslib_1.__generator(this, function (_a) {
                                    if (ele.onClick) {
                                        ele.onClick(ele);
                                        return [2 /*return*/];
                                    }
                                    return [2 /*return*/];
                                });
                            }); },
                        });
                        return [2 /*return*/];
                    });
                }); };
            }
            return Object.assign(ele, {
                text: text,
                onClick2: onClick,
            });
        });
        var newItems = items2;
        var moreItems = [];
        if (column && items2.length > column) {
            newItems = tslib_1.__spreadArray([], tslib_1.__read(items2), false).splice(0, column);
            moreItems = tslib_1.__spreadArray([], tslib_1.__read(items2), false).splice(column, items2.length);
        }
        return {
            newItems: newItems,
            moreItems: moreItems,
        };
    };
    var _b = getItems(), newItems = _b.newItems, moreItems = _b.moreItems;
    if (!newItems || newItems.length === 0) {
        return null;
    }
    if (mode === 'table-cell') {
        return ((0, jsx_runtime_1.jsxs)(antd_1.Space, tslib_1.__assign({}, spaceProps, { children: [newItems === null || newItems === void 0 ? void 0 : newItems.map(function (ele, index) {
                    return ((0, jsx_runtime_1.jsx)(ItemComponent, tslib_1.__assign({}, ele, { onClick: ele.onClick2, text: ele.text })));
                }), moreItems && moreItems.length > 0 && ((0, jsx_runtime_1.jsx)(antd_1.Dropdown, tslib_1.__assign({ menu: {
                        items: moreItems.map(function (ele, index) { return ({
                            label: ele.text,
                            key: index,
                        }); }),
                        onClick: function (e) {
                            var item = moreItems[e.key];
                            item.onClick2();
                        },
                    }, placement: "top", arrow: true }, { children: (0, jsx_runtime_1.jsx)("a", tslib_1.__assign({ onClick: function (e) { return e.preventDefault(); } }, { children: "\u66F4\u591A" })) })))] })));
    }
    return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: web_module_less_1.default.panelContainer }, { children: [moreItems && moreItems.length > 0 && ((0, jsx_runtime_1.jsx)(antd_1.Dropdown, tslib_1.__assign({ menu: {
                    items: moreItems.map(function (ele, index) { return ({
                        label: ele.text,
                        key: index,
                    }); }),
                    onClick: function (e) {
                        var item = moreItems[e.key];
                        item.onClick2();
                    },
                }, arrow: true }, { children: (0, jsx_runtime_1.jsx)(antd_1.Typography, tslib_1.__assign({ className: web_module_less_1.default.more }, { children: "\u66F4\u591A" })) }))), (0, jsx_runtime_1.jsx)(antd_1.Space, tslib_1.__assign({}, spaceProps, { children: newItems === null || newItems === void 0 ? void 0 : newItems.map(function (ele, index) {
                    return ((0, jsx_runtime_1.jsx)(ItemComponent, tslib_1.__assign({ type: "button" }, ele, { onClick: ele.onClick2, text: ele.text })));
                }) }))] })));
}
exports.default = Render;
