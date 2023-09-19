"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableContext = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const usefulFn_1 = require("../../utils/usefulFn");
const list_1 = tslib_1.__importDefault(require("../list"));
const toolBar_1 = tslib_1.__importDefault(require("../list/toolBar"));
const buttonGroup_1 = tslib_1.__importDefault(require("../list/buttonGroup"));
const index_module_less_1 = tslib_1.__importDefault(require("./index.module.less"));
const useWidth_1 = require("../../platforms/web/responsive/useWidth");
exports.TableContext = (0, react_1.createContext)({
    tableAttributes: undefined,
    entity: undefined,
    schema: undefined,
    setTableAttributes: undefined,
    setSchema: undefined,
    onReset: undefined,
});
const ProList = (props) => {
    const { title, buttonGroup, entity, extraActions, onAction, disabledOp, attributes, data, loading, tablePagination, rowSelection, onReload, } = props;
    const [tableAttributes, setTableAttributes] = (0, react_1.useState)([]);
    const [schema, setSchema] = (0, react_1.useState)(undefined);
    (0, react_1.useEffect)(() => {
        if (schema) {
            const judgeAttributes = (0, usefulFn_1.translateAttributes)(schema, entity, attributes);
            const newTableAttributes = judgeAttributes.map((ele) => ({ attribute: ele, show: true }));
            setTableAttributes(newTableAttributes);
        }
    }, [attributes, schema]);
    const width = (0, useWidth_1.useWidth)();
    const isMobile = width === 'xs';
    return ((0, jsx_runtime_1.jsx)(exports.TableContext.Provider, { value: {
            tableAttributes,
            entity: entity,
            schema,
            setTableAttributes,
            setSchema,
            onReset: () => {
                if (schema) {
                    const judgeAttributes = (0, usefulFn_1.translateAttributes)(schema, entity, attributes);
                    const newTableAttr = judgeAttributes.map((ele) => ({
                        attribute: ele,
                        show: true,
                    }));
                    setTableAttributes(newTableAttr);
                }
            },
        }, children: (0, jsx_runtime_1.jsxs)("div", { className: index_module_less_1.default.listContainer, children: [!isMobile && ((0, jsx_runtime_1.jsx)(toolBar_1.default, { title: title, buttonGroup: buttonGroup, reload: () => {
                        onReload && onReload();
                    } })), isMobile && (0, jsx_runtime_1.jsx)(buttonGroup_1.default, { items: buttonGroup }), (0, jsx_runtime_1.jsx)(list_1.default, { entity: entity, extraActions: extraActions, onAction: onAction, disabledOp: disabledOp, attributes: attributes, data: data, loading: loading, tablePagination: tablePagination, rowSelection: rowSelection })] }) }));
};
exports.default = ProList;
