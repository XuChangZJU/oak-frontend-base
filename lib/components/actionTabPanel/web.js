"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var antd_1 = require("antd");
var icon_1 = tslib_1.__importDefault(require("../icon"));
var classnames_1 = tslib_1.__importDefault(require("classnames"));
var web_module_less_1 = tslib_1.__importDefault(require("./web.module.less"));
var confirm = antd_1.Modal.confirm;
function ItemComponent(props) {
    var _a;
    var icon = props.icon, buttonProps = props.buttonProps, render = props.render, onClick = props.onClick, iconRender = props.iconRender, iconProps = props.iconProps, mode = props.mode, text = props.text;
    if (render) {
        return (0, jsx_runtime_1.jsx)("div", { onClick: onClick, children: render });
    }
    var _b = iconProps || {}, _c = _b.style, style = _c === void 0 ? {} : _c, _d = _b.rootStyle, rootStyle = _d === void 0 ? {} : _d, bgColor = _b.bgColor;
    var icon2;
    if (iconRender) {
        icon2 = iconRender;
    }
    else if (typeof icon === 'string') {
        icon2 = ((0, jsx_runtime_1.jsx)(icon_1.default, { name: icon, className: (0, classnames_1.default)(web_module_less_1.default.icon, (_a = {},
                _a[web_module_less_1.default.iconWhite] = !!bgColor,
                _a)), style: style }));
    }
    else {
        icon2 = icon;
    }
    return ((0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ className: web_module_less_1.default.btn, type: "text" }, buttonProps, { onClick: onClick, children: (0, jsx_runtime_1.jsxs)("div", { className: web_module_less_1.default.space, children: [mode === 'card' && !!icon2 ? ((0, jsx_runtime_1.jsx)("div", { className: web_module_less_1.default.iconBox, style: Object.assign({}, bgColor && {
                        backgroundColor: bgColor,
                    }, rootStyle), children: icon2 })) : (icon2), (0, jsx_runtime_1.jsx)(antd_1.Typography, { children: text })] }) })));
}
function Render(props) {
    var _this = this;
    var methods = props.methods, data = props.data;
    var t = methods.t, getActionName = methods.getActionName, getAlertOptions = methods.getAlertOptions;
    var items = data.items, entity = data.entity, _a = data.rows, rows = _a === void 0 ? 2 : _a, //默认两行
    _b = data.column, //默认两行
    column = _b === void 0 ? 5 : _b, _c = data.id, id = _c === void 0 ? 'action_tab_panel_scroll' : _c, _d = data.mode, mode = _d === void 0 ? 'text' : _d;
    var _e = tslib_1.__read((0, react_1.useState)(items), 2), newItems = _e[0], setNewItems = _e[1];
    var _f = tslib_1.__read((0, react_1.useState)(0), 2), slideLeft = _f[0], setSlideLeft = _f[1];
    var _g = tslib_1.__read((0, react_1.useState)(0), 2), slideWidth = _g[0], setSlideWidth = _g[1];
    var _h = tslib_1.__read((0, react_1.useState)(false), 2), slideShow = _h[0], setSlideShow = _h[1];
    var _j = tslib_1.__read((0, react_1.useState)(0), 2), slideRatio = _j[0], setSideRatio = _j[1];
    var _k = tslib_1.__read((0, react_1.useState)([]), 2), tabNums = _k[0], setTabNums = _k[1];
    var _l = tslib_1.__read((0, react_1.useState)(rows * column), 2), count = _l[0], setCount = _l[1];
    (0, react_1.useEffect)(function () {
        getItems();
    }, []);
    (0, react_1.useEffect)(function () {
        getItems();
    }, [items]);
    var getItems = function () {
        var items2 = items.filter(function (ele) {
            var show = ele.show;
            var showResult = ele.hasOwnProperty('show') ? show : true;
            return showResult;
        });
        var num = items2.length % count !== 0
            ? parseInt((items2.length / count).toString()) + 1
            : items2.length / count;
        var tabNums = [];
        for (var i = 1; i <= num; i++) {
            tabNums.push(i);
        }
        if (items2 && items2.length > 0) {
            var doc = window.document.getElementById(id);
            var clientWidth = (doc && doc.clientWidth) || 0;
            var totalLength = tabNums.length * clientWidth; //分类列表总长度
            var slideRatio_1 = (50 / totalLength) * (clientWidth / window.innerWidth); //滚动列表长度与滑条长度比例
            var slideWidth_1 = (clientWidth / totalLength) * 50; //当前显示红色滑条的长度(保留两位小数)
            setSlideWidth(slideWidth_1);
            setSideRatio(slideRatio_1);
        }
        setTabNums(tabNums);
        setNewItems(tslib_1.__spreadArray([], tslib_1.__read(items2), false));
        setSlideShow(num > 1);
    };
    if (!newItems || newItems.length === 0) {
        return null;
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: web_module_less_1.default.tabContainer, children: [(0, jsx_runtime_1.jsx)("div", { className: web_module_less_1.default.scrollBox, children: (0, jsx_runtime_1.jsx)("div", { id: id, className: web_module_less_1.default.scrollView, onScroll: function (e) {
                        var scrollLeft = e.target.scrollLeft;
                        setSlideLeft(scrollLeft * slideRatio);
                    }, children: (0, jsx_runtime_1.jsx)("div", { className: web_module_less_1.default.tabView, children: tabNums.map(function (tabNum, index) {
                            return ((0, jsx_runtime_1.jsx)("div", { className: web_module_less_1.default.btnContainer, children: newItems
                                    .filter(function (btn, index2) {
                                    return (tabNum - 1) * count <
                                        index2 + 1 &&
                                        index2 + 1 <= tabNum * count;
                                })
                                    .map(function (ele, index2) {
                                    var _a;
                                    var label = ele.label, action = ele.action;
                                    var text;
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
                                    return ((0, jsx_runtime_1.jsx)("div", { className: (0, classnames_1.default)(web_module_less_1.default.btnBox, (_a = {},
                                            _a[web_module_less_1.default.btnBox_top] = newItems.length >
                                                column &&
                                                index2 >
                                                    column - 1,
                                            _a)), style: {
                                            height: "calc(100% / ".concat(newItems.length >
                                                column
                                                ? rows
                                                : 1, ")"),
                                            width: "calc(100% / ".concat(column, ")"),
                                        }, children: (0, jsx_runtime_1.jsx)(ItemComponent, tslib_1.__assign({}, ele, { onClick: onClick, mode: mode, text: text })) }, index2));
                                }) }));
                        }) }) }) }), slideShow && ((0, jsx_runtime_1.jsx)("div", { className: web_module_less_1.default.slideBar, children: (0, jsx_runtime_1.jsx)("div", { className: web_module_less_1.default.slideShow, style: {
                        width: slideWidth,
                        marginLeft: slideLeft <= 1 ? 0 : slideLeft,
                    } }) }))] }));
}
exports.default = Render;
