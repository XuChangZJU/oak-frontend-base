"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var icons_1 = require("@ant-design/icons");
var antd_1 = require("antd");
var react_1 = require("react");
var index_module_less_1 = tslib_1.__importDefault(require("./index.module.less"));
var index_1 = require("../../listPro/index");
var usefulFn_1 = require("../../../utils/usefulFn");
var web_1 = require("../../../platforms/web");
function ListItem(props) {
    var features = (0, web_1.useFeatures)();
    var title = props.title, onSelect = props.onSelect, showToBottom = props.showToBottom, showToTop = props.showToTop, onMoveTop = props.onMoveTop, onMoveBottom = props.onMoveBottom;
    return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: index_module_less_1.default.listItemView, onClick: onSelect }, { children: [(0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: index_module_less_1.default.listItemTitle }, { children: title })), (0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: index_module_less_1.default.listIconView }, { children: [(0, jsx_runtime_1.jsx)(antd_1.Tooltip, tslib_1.__assign({ title: features.locales.t("leftPin") }, { children: showToTop && ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: index_module_less_1.default.listIcon, onClick: function (e) {
                                e.stopPropagation();
                                e.preventDefault();
                                onMoveTop();
                            } }, { children: (0, jsx_runtime_1.jsx)(icons_1.VerticalAlignTopOutlined, {}) }))) })), (0, jsx_runtime_1.jsx)(antd_1.Tooltip, tslib_1.__assign({ title: features.locales.t("rightPin") }, { children: showToBottom && ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: index_module_less_1.default.listIcon, onClick: function (e) {
                                e.stopPropagation();
                                e.preventDefault();
                                onMoveBottom();
                            } }, { children: (0, jsx_runtime_1.jsx)(icons_1.VerticalAlignBottomOutlined, {}) }))) }))] }))] })));
}
function ColumnSetting() {
    var features = (0, web_1.useFeatures)();
    var _a = (0, react_1.useContext)(index_1.TableContext), tableAttributes = _a.tableAttributes, entity = _a.entity, schema = _a.schema, setTableAttributes = _a.setTableAttributes, onReset = _a.onReset;
    var _b = tslib_1.__read((0, react_1.useState)([]), 2), treeData = _b[0], setTreeData = _b[1];
    var _c = tslib_1.__read((0, react_1.useState)([]), 2), checkedKeys = _c[0], setCheckedKeys = _c[1];
    // 初始化treeData, treeData跟随attributes, attributes不会有增删变动
    (0, react_1.useEffect)(function () {
        var newTreeData = [];
        var newCheckedKeys = [];
        if (schema && entity && tableAttributes) {
            tableAttributes.forEach(function (ele, index) {
                var path = (0, usefulFn_1.getPath)(ele.attribute);
                var _a = (0, usefulFn_1.resolvePath)(schema, entity, path), entityI18n = _a.entity, attr = _a.attr;
                var title = (0, usefulFn_1.getLabel)(ele.attribute, entityI18n, attr, function (k, p) { return features.locales.t(k, p); });
                newTreeData.push({
                    title: title,
                    key: path,
                    keyIndex: index,
                });
                if (ele.show) {
                    newCheckedKeys.push(path);
                }
            });
        }
        setCheckedKeys(newCheckedKeys);
        setTreeData(newTreeData);
    }, [tableAttributes, schema]);
    var move = function (path, targetPath, dropPosition) {
        var newAttributes = tslib_1.__spreadArray([], tslib_1.__read(tableAttributes), false);
        var findIndex = newAttributes.findIndex(function (ele) { return (0, usefulFn_1.getPath)(ele.attribute) === path; });
        var targetIndex = newAttributes.findIndex(function (ele) { return (0, usefulFn_1.getPath)(ele.attribute) === targetPath; });
        var isDownWard = dropPosition > findIndex;
        if (findIndex < 0)
            return;
        var targetItem = newAttributes[findIndex];
        newAttributes.splice(findIndex, 1);
        if (dropPosition === 0) {
            newAttributes.unshift(targetItem);
        }
        else {
            newAttributes.splice(isDownWard ? targetIndex : targetIndex + 1, 0, targetItem);
        }
        setTableAttributes(newAttributes);
    };
    // tree的复选框选中,
    var onCheck = function (node) {
        var tableArr = tableAttributes.find(function (ele) { return (0, usefulFn_1.getPath)(ele.attribute) === node.key; });
        if (tableArr) {
            tableArr.show = !tableArr.show;
            setTableAttributes(tslib_1.__spreadArray([], tslib_1.__read(tableAttributes), false));
        }
    };
    var listDom = ((0, jsx_runtime_1.jsx)(antd_1.Tree, { itemHeight: 24, draggable: true, checkable: true, onDrop: function (info) {
            var dropKey = info.node.key;
            var dragKey = info.dragNode.key;
            var dropPosition = info.dropPosition, dropToGap = info.dropToGap;
            var position = dropPosition === -1 || !dropToGap ? dropPosition + 1 : dropPosition;
            move(dragKey, dropKey, position);
        }, blockNode: true, onCheck: function (checkedKeys, e) {
            onCheck(e.node);
        }, titleRender: function (node) { return ((0, jsx_runtime_1.jsx)(ListItem, { title: node.title, nodeKey: node.key, showToTop: node.keyIndex !== 0, showToBottom: node.keyIndex !== (treeData.length - 1), onSelect: function () { return onCheck(node); }, onMoveTop: function () { return move(node.key, treeData[0].key, 0); }, onMoveBottom: function () { return move(node.key, treeData[treeData.length - 1].key, treeData.length + 1); } })); }, checkedKeys: checkedKeys, showLine: false, treeData: treeData }));
    return ((0, jsx_runtime_1.jsx)(antd_1.Popover, tslib_1.__assign({ arrow: false, title: (0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: index_module_less_1.default.titleView }, { children: [(0, jsx_runtime_1.jsx)("strong", { children: features.locales.t('columnSetting') }), (0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ type: 'link', onClick: onReset }, { children: features.locales.t('common::reset') }))] })), trigger: "click", placement: "bottomRight", content: (0, jsx_runtime_1.jsx)(antd_1.Space, { children: listDom }) }, { children: (0, jsx_runtime_1.jsx)(antd_1.Tooltip, tslib_1.__assign({ title: features.locales.t('columnSetting') }, { children: (0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: index_module_less_1.default.iconBox }, { children: (0, jsx_runtime_1.jsx)(icons_1.SettingOutlined, {}) })) })) })));
}
exports.default = ColumnSetting;
