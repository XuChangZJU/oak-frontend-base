"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const antd_1 = require("antd");
const assert_1 = require("oak-domain/lib/utils/assert");
const lodash_1 = require("oak-domain/lib/utils/lodash");
const actionBtn_1 = tslib_1.__importDefault(require("../actionBtn"));
const usefulFn_1 = require("../../utils/usefulFn");
const renderCell_1 = tslib_1.__importDefault(require("./renderCell"));
const listPro_1 = require("../listPro");
function Render(props) {
    const { methods, data: oakData } = props;
    const { t } = methods;
    const { loading, entity, schema, extraActions, data, colorDict, disabledOp = false, tablePagination, onAction, rowSelection, attributes, i18n, hideHeader, judgeAttributes, } = oakData;
    const [tableColumns, setTabelColumns] = (0, react_1.useState)([]);
    const { tableAttributes, setSchema } = (0, react_1.useContext)(listPro_1.TableContext);
    // 为了i18更新时能够重新渲染
    const zhCNKeys = i18n?.store?.data?.zh_CN && Object.keys(i18n.store.data.zh_CN).length;
    const selectedRowKeys = rowSelection?.selectedRowKeys || [];
    // 如果字段过多，给table加上
    const showScroll = attributes && attributes.length >= 8;
    (0, react_1.useEffect)(() => {
        if (schema) {
            setSchema && setSchema(schema);
            let showAttributes = judgeAttributes;
            if (tableAttributes) {
                showAttributes = tableAttributes.filter((ele) => ele.show).map((ele) => ele.attribute);
            }
            const tableColumns = showAttributes && showAttributes.map((ele) => {
                if (ele.entity === 'notExist') {
                    (0, assert_1.assert)(ele.attribute.width, `非schema属性${ele.attr}需要自定义width`);
                    (0, assert_1.assert)(ele.attribute.type, `非schema属性${ele.attr}需要自定义type`);
                    (0, assert_1.assert)(ele.attribute.label, `非schema属性${ele.attr}需要自定义label`);
                }
                const title = (0, usefulFn_1.getLabel)(ele.attribute, ele.entity, ele.attr, t);
                const width = (0, usefulFn_1.getWidth)(ele.attribute, ele.attrType);
                const type = (0, usefulFn_1.getType)(ele.attribute, ele.attrType);
                const align = (0, usefulFn_1.getAlign)(ele.attrType);
                const column = {
                    key: ele.path,
                    title,
                    align,
                    render: (v, row) => {
                        const value = (0, usefulFn_1.getValue)(row, ele.path, ele.entity, ele.attr, ele.attrType, t);
                        const stateValue = (0, lodash_1.get)(row, ele.path);
                        let href = '';
                        if ([null, undefined, ''].includes(stateValue)) {
                            return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, {});
                        }
                        const color = colorDict && colorDict[ele.entity]?.[ele.attr]?.[stateValue];
                        if (type === 'enum') {
                            console.warn(color, `${ele.entity}实体${ele.attr}颜色定义缺失`);
                        }
                        if (type === 'link') {
                            href = (0, usefulFn_1.getLinkUrl)(ele.attribute, { oakId: row?.id });
                        }
                        return ((0, jsx_runtime_1.jsx)(renderCell_1.default, { color: color, value: value, type: type, linkUrl: href }));
                    }
                };
                if (width) {
                    Object.assign(column, { width });
                }
                else {
                    // 没有宽度的设置ellipsis
                    Object.assign(column, {
                        ellipsis: {
                            showTitle: false,
                        }
                    });
                }
                return column;
            });
            if (!disabledOp && tableColumns) {
                tableColumns.push({
                    fixed: 'right',
                    align: 'left',
                    title: '操作',
                    key: 'operation',
                    width: 280,
                    render: (value, row) => {
                        const oakActions = row?.['#oakLegalActions'];
                        // assert(!!oakActions, '行数据中不存在#oakLegalActions, 请禁用(disableOp:true)或添加actions')
                        return ((0, jsx_runtime_1.jsx)(actionBtn_1.default, { entity: entity, extraActions: extraActions, actions: oakActions || [], cascadeActions: row?.['#oakLegalCascadeActions'], onAction: (action, cascadeAction) => onAction && onAction(row, action, cascadeAction) }));
                    }
                });
            }
            setTabelColumns(tableColumns);
        }
    }, [data, zhCNKeys, schema, tableAttributes]);
    return ((0, jsx_runtime_1.jsx)(antd_1.Table, { rowKey: "id", rowSelection: rowSelection?.type && {
            type: rowSelection?.type,
            selectedRowKeys,
            onChange: (selectedRowKeys, row, info) => {
                rowSelection?.onChange &&
                    rowSelection?.onChange(selectedRowKeys, row, info);
            },
        }, loading: loading, dataSource: data, columns: tableColumns, pagination: tablePagination, scroll: showScroll
            ? {
                scrollToFirstRowOnChange: true,
                x: 1200,
            }
            : {}, onRow: (record) => {
            return {
                onClick: () => {
                    const index = selectedRowKeys.findIndex((ele) => ele === record.id);
                    let keys = selectedRowKeys;
                    if (rowSelection?.type === 'checkbox') {
                        if (index !== -1) {
                            keys.splice(index, 1);
                        }
                        else {
                            keys.push(record.id);
                        }
                    }
                    else {
                        keys = [record.id];
                    }
                    const row = data.filter((ele) => keys.includes(ele.id));
                    rowSelection?.onChange &&
                        rowSelection?.onChange(keys, row, { type: 'all' });
                },
            };
        }, showHeader: !hideHeader }));
}
exports.default = Render;
