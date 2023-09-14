"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableContext = void 0;
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var usefulFn_1 = require("../../utils/usefulFn");
var list_1 = tslib_1.__importDefault(require("../list"));
var toolBar_1 = tslib_1.__importDefault(require("../list/toolBar"));
var buttonGroup_1 = tslib_1.__importDefault(require("../list/buttonGroup"));
var index_module_less_1 = tslib_1.__importDefault(require("./index.module.less"));
var useWidth_1 = require("../../platforms/web/responsive/useWidth");
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
    var _b = tslib_1.__read((0, react_1.useState)(undefined), 2), schema = _b[0], setSchema = _b[1];
    (0, react_1.useEffect)(function () {
        if (schema) {
            var judgeAttributes = (0, usefulFn_1.translateAttributes)(schema, entity, attributes);
            var newTableAttributes = judgeAttributes.map(function (ele) { return ({ attribute: ele, show: true }); });
            setTableAttributes(newTableAttributes);
        }
    }, [attributes, schema]);
    var width = (0, useWidth_1.useWidth)();
    var isMobile = width === 'xs';
    return ((0, jsx_runtime_1.jsx)(exports.TableContext.Provider, { value: {
            tableAttributes: tableAttributes,
            entity: entity,
            schema: schema,
            setTableAttributes: setTableAttributes,
            setSchema: setSchema,
            onReset: function () {
                if (schema) {
                    var judgeAttributes = (0, usefulFn_1.translateAttributes)(schema, entity, attributes);
                    var newTableAttr = judgeAttributes.map(function (ele) { return ({
                        attribute: ele,
                        show: true,
                    }); });
                    setTableAttributes(newTableAttr);
                }
            },
        }, children: (0, jsx_runtime_1.jsxs)("div", { className: index_module_less_1.default.listContainer, children: [!isMobile && ((0, jsx_runtime_1.jsx)(toolBar_1.default, { title: title, buttonGroup: buttonGroup, reload: function () {
                        onReload && onReload();
                    } })), isMobile && (0, jsx_runtime_1.jsx)(buttonGroup_1.default, { items: buttonGroup }), (0, jsx_runtime_1.jsx)(list_1.default, { entity: entity, extraActions: extraActions, onAction: onAction, disabledOp: disabledOp, attributes: attributes, data: data, loading: loading, tablePagination: tablePagination, rowSelection: rowSelection })] }) }));
};
exports.default = ProList;
