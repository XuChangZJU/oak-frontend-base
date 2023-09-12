import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useEffect, useState } from 'react';
import { translateAttributes } from '../../utils/usefulFn';
import List from '../list';
import ToolBar from '../list/toolBar';
import ButtonGroup from '../list/buttonGroup';
import Style from './index.module.less';
import { useWidth } from '../../platforms/web/responsive/useWidth';
export const TableContext = createContext({
    tableAttributes: undefined,
    entity: undefined,
    schema: undefined,
    setTableAttributes: undefined,
    setSchema: undefined,
    onReset: undefined,
});
const ProList = (props) => {
    const { title, buttonGroup, entity, extraActions, onAction, disabledOp, attributes, data, loading, tablePagination, rowSelection, onReload, } = props;
    const [tableAttributes, setTableAttributes] = useState([]);
    const [schema, setSchema] = useState(undefined);
    useEffect(() => {
        if (schema) {
            const judgeAttributes = translateAttributes(schema, entity, attributes);
            const newTableAttributes = judgeAttributes.map((ele) => ({ attribute: ele, show: true }));
            setTableAttributes(newTableAttributes);
        }
    }, [attributes, schema]);
    const width = useWidth();
    const isMobile = width === 'xs';
    return (_jsx(TableContext.Provider, { value: {
            tableAttributes,
            entity: entity,
            schema,
            setTableAttributes,
            setSchema,
            onReset: () => {
                if (schema) {
                    const judgeAttributes = translateAttributes(schema, entity, attributes);
                    const newTableAttr = judgeAttributes.map((ele) => ({
                        attribute: ele,
                        show: true,
                    }));
                    setTableAttributes(newTableAttr);
                }
            },
        }, children: _jsxs("div", { className: Style.listContainer, children: [!isMobile && (_jsx(ToolBar, { title: title, buttonGroup: buttonGroup, reload: () => {
                        onReload && onReload();
                    } })), isMobile && _jsx(ButtonGroup, { items: buttonGroup }), _jsx(List, { entity: entity, extraActions: extraActions, onAction: onAction, disabledOp: disabledOp, attributes: attributes, data: data, loading: loading, tablePagination: tablePagination, rowSelection: rowSelection })] }) }));
};
export default ProList;
