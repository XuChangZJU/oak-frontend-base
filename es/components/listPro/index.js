import React, { createContext, useEffect, useState } from 'react';
import { translateAttributes } from '../../utils/usefulFn';
import List from '../list';
import ToolBar from '../list/toolBar';
import ButtonGroup from '../list/buttonGroup';
import Style from './index.module.less';
import { useWidth } from '../../platforms/web/responsive/useWidth';
import { useFeatures } from '../../platforms/web';
export const TableContext = createContext({
    tableAttributes: undefined,
    entity: undefined,
    schema: undefined,
    setTableAttributes: undefined,
    setSchema: undefined,
    onReset: undefined,
});
const ProList = (props) => {
    const { title, buttonGroup, entity, extraActions, onAction, disabledOp, attributes, data, loading, tablePagination, rowSelection, onReload, disableSerialNumber, } = props;
    const features = useFeatures();
    const [tableAttributes, setTableAttributes] = useState([]);
    const [schema, setSchema] = useState(undefined);
    const width = useWidth();
    const isMobile = width === 'xs';
    const initTableAttributes = () => {
        if (schema) {
            const judgeAttributes = translateAttributes(schema, entity, attributes);
            const newTableAttributes = judgeAttributes.map((ele) => ({
                attribute: ele,
                show: true,
            }));
            if (tablePagination && !disableSerialNumber) {
                // 存在分页配置 启用#序号
                newTableAttributes.unshift({
                    attribute: {
                        path: '#',
                        attribute: {
                            label: '#',
                            path: '#',
                        },
                        attrType: 'number',
                        attr: '#',
                        entity: entity,
                    },
                    show: true,
                    disabled: true,
                    disableCheckbox: true,
                });
            }
            setTableAttributes(newTableAttributes);
        }
    };
    useEffect(() => {
        initTableAttributes();
    }, [attributes, schema]);
    const showTotal = (total) => {
        const totalStr = features.locales.t('total number of rows');
        return `${totalStr}：${total > 999 ? `${total} +` : total}`;
    };
    return (<TableContext.Provider value={{
            tableAttributes,
            entity: entity,
            schema,
            setTableAttributes,
            setSchema,
            onReset: () => {
                initTableAttributes();
            },
        }}>
            <div className={Style.container}>
                {!isMobile && (<ToolBar title={title} buttonGroup={buttonGroup} reload={() => {
                onReload && onReload();
            }}/>)}
                {isMobile && <ButtonGroup items={buttonGroup}/>}
                <List entity={entity} extraActions={extraActions} onAction={onAction} disabledOp={disabledOp} attributes={attributes} data={!disableSerialNumber
            ? data?.map((ele, index) => {
                if (tablePagination) {
                    const total = tablePagination.total || 0;
                    const pageSize = tablePagination.pageSize || 20; //条数
                    const current = tablePagination.current || 1; //当前页
                    ele['#'] =
                        pageSize * (current - 1) +
                            (index + 1);
                }
                return ele;
            })
            : data} loading={loading} tablePagination={Object.assign({
            showTotal,
        }, tablePagination)} rowSelection={rowSelection}/>
            </div>
        </TableContext.Provider>);
};
export default ProList;
