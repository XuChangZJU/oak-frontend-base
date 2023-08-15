"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableContext = void 0;
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var list_1 = tslib_1.__importDefault(require("../list"));
var toolBar_1 = tslib_1.__importDefault(require("../list/toolBar"));
var buttonGroup_1 = tslib_1.__importDefault(require("../list/buttonGroup"));
var index_module_less_1 = tslib_1.__importDefault(require("./index.module.less"));
var useWidth_1 = require("../../platforms/web/responsive/useWidth");
var web_1 = require("../../platforms/web");
exports.TableContext = (0, react_1.createContext)({
    tableAttributes: undefined,
    entity: undefined,
    schema: undefined,
    setTableAttributes: undefined,
    setSchema: undefined,
    onReset: undefined,
});
var ProList = function (props) {
    var title = props.title, buttonGroup = props.buttonGroup, entity = props.entity, extraActions = props.extraActions, onAction = props.onAction, disabledOp = props.disabledOp, attributes = props.attributes, data = props.data, loading = props.loading, tablePagination = props.tablePagination, rowSelection = props.rowSelection, onReload = props.onReload;
    var _a = tslib_1.__read((0, react_1.useState)([]), 2), tableAttributes = _a[0], setTableAttributes = _a[1];
    (0, react_1.useEffect)(function () {
        var newTabelAttributes = attributes.map(function (ele) { return ({ attribute: ele, show: true }); });
        setTableAttributes(newTabelAttributes);
    }, [attributes]);
    var _b = tslib_1.__read((0, react_1.useState)(undefined), 2), schema = _b[0], setSchema = _b[1];
    var width = (0, useWidth_1.useWidth)();
    var isMobile = width === 'xs';
    var features = (0, web_1.useFeatures)();
    return ((0, jsx_runtime_1.jsx)(exports.TableContext.Provider, tslib_1.__assign({ value: {
            tableAttributes: tableAttributes,
            entity: entity,
            schema: schema,
            setTableAttributes: setTableAttributes,
            setSchema: setSchema,
            onReset: function () {
                var newTableAttr = attributes.map(function (ele) { return ({ attribute: ele, show: true }); });
                setTableAttributes(newTableAttr);
            }
        } }, { children: (0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: index_module_less_1.default.listContainer }, { children: [!isMobile && ((0, jsx_runtime_1.jsx)(toolBar_1.default, { title: title || (features.locales.t("".concat(entity, ":name")) + features.locales.t('list')), buttonGroup: buttonGroup, reload: function () {
                        onReload && onReload();
                    } })), isMobile && ((0, jsx_runtime_1.jsx)(buttonGroup_1.default, { items: buttonGroup })), (0, jsx_runtime_1.jsx)(list_1.default, { entity: entity, extraActions: extraActions, onAction: onAction, disabledOp: disabledOp, attributes: attributes, data: data, loading: loading, tablePagination: tablePagination, rowSelection: rowSelection })] })) })));
};
exports.default = ProList;
