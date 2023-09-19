"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const icons_1 = require("@ant-design/icons");
const antd_1 = require("antd");
const index_module_less_1 = tslib_1.__importDefault(require("./index.module.less"));
const index_1 = require("../../listPro/index");
const usefulFn_1 = require("../../../utils/usefulFn");
const web_1 = require("../../../platforms/web");
function ListItem(props) {
    const features = (0, web_1.useFeatures)();
    const { title, onSelect, showToBottom, showToTop, onMoveTop, onMoveBottom, } = props;
    return ((0, jsx_runtime_1.jsxs)("div", { className: index_module_less_1.default.listItemView, onClick: onSelect, children: [(0, jsx_runtime_1.jsx)("div", { className: index_module_less_1.default.listItemTitle, children: title }), (0, jsx_runtime_1.jsxs)("div", { className: index_module_less_1.default.listIconView, children: [(0, jsx_runtime_1.jsx)(antd_1.Tooltip, { title: features.locales.t('leftPin'), children: showToTop && ((0, jsx_runtime_1.jsx)("div", { className: index_module_less_1.default.listIcon, onClick: (e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onMoveTop();
                            }, children: (0, jsx_runtime_1.jsx)(icons_1.VerticalAlignTopOutlined, {}) })) }), (0, jsx_runtime_1.jsx)(antd_1.Tooltip, { title: features.locales.t('rightPin'), children: showToBottom && ((0, jsx_runtime_1.jsx)("div", { className: index_module_less_1.default.listIcon, onClick: (e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onMoveBottom();
                            }, children: (0, jsx_runtime_1.jsx)(icons_1.VerticalAlignBottomOutlined, {}) })) })] })] }));
}
function ColumnSetting() {
    const features = (0, web_1.useFeatures)();
    const { tableAttributes, entity, schema, setTableAttributes, onReset } = (0, react_1.useContext)(index_1.TableContext);
    const [treeData, setTreeData] = (0, react_1.useState)([]);
    const [checkedKeys, setCheckedKeys] = (0, react_1.useState)([]);
    // 初始化treeData, treeData跟随attributes, attributes不会有增删变动
    (0, react_1.useEffect)(() => {
        const newTreeData = [];
        const newCheckedKeys = [];
        if (schema && entity && tableAttributes) {
            tableAttributes.forEach((ele, index) => {
                const title = (0, usefulFn_1.getLabel)(ele.attribute.attribute, ele.attribute.entity, ele.attribute.attr, (k, p) => features.locales.t(k, p));
                newTreeData.push({
                    title,
                    key: ele.attribute.path,
                    keyIndex: index,
                });
                if (ele.show) {
                    newCheckedKeys.push(ele.attribute.path);
                }
            });
        }
        setCheckedKeys(newCheckedKeys);
        setTreeData(newTreeData);
    }, [tableAttributes, schema]);
    const move = (path, targetPath, dropPosition) => {
        const newAttributes = [...tableAttributes];
        const findIndex = newAttributes.findIndex((ele) => (0, usefulFn_1.getPath)(ele.attribute.attribute) === path);
        const targetIndex = newAttributes.findIndex((ele) => (0, usefulFn_1.getPath)(ele.attribute.attribute) === targetPath);
        const isDownWard = dropPosition > findIndex;
        if (findIndex < 0)
            return;
        const targetItem = newAttributes[findIndex];
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
    const onCheck = (node) => {
        const tableArr = tableAttributes.find((ele) => (0, usefulFn_1.getPath)(ele.attribute.attribute) === node.key);
        if (tableArr) {
            tableArr.show = !tableArr.show;
            setTableAttributes([...tableAttributes]);
        }
    };
    const listDom = ((0, jsx_runtime_1.jsx)(antd_1.Tree, { itemHeight: 24, draggable: true, checkable: true, onDrop: (info) => {
            const dropKey = info.node.key;
            const dragKey = info.dragNode.key;
            const { dropPosition, dropToGap } = info;
            const position = dropPosition === -1 || !dropToGap
                ? dropPosition + 1
                : dropPosition;
            move(dragKey, dropKey, position);
        }, blockNode: true, onCheck: (checkedKeys, e) => {
            onCheck(e.node);
        }, titleRender: (node) => ((0, jsx_runtime_1.jsx)(ListItem, { title: node.title, nodeKey: node.key, showToTop: node.keyIndex !== 0, showToBottom: node.keyIndex !== treeData.length - 1, onSelect: () => onCheck(node), onMoveTop: () => move(node.key, treeData[0].key, 0), onMoveBottom: () => move(node.key, treeData[treeData.length - 1].key, treeData.length + 1) })), checkedKeys: checkedKeys, showLine: false, treeData: treeData }));
    return ((0, jsx_runtime_1.jsx)(antd_1.Popover, { arrow: false, title: (0, jsx_runtime_1.jsxs)("div", { className: index_module_less_1.default.titleView, children: [(0, jsx_runtime_1.jsx)("strong", { children: features.locales.t('columnSetting') }), (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "link", onClick: onReset, children: features.locales.t('common::reset') })] }), trigger: "click", placement: "bottomRight", content: (0, jsx_runtime_1.jsx)(antd_1.Space, { children: listDom }), children: (0, jsx_runtime_1.jsx)(antd_1.Tooltip, { title: features.locales.t('columnSetting'), children: (0, jsx_runtime_1.jsx)("div", { className: index_module_less_1.default.iconBox, children: (0, jsx_runtime_1.jsx)(icons_1.SettingOutlined, {}) }) }) }));
}
exports.default = ColumnSetting;
