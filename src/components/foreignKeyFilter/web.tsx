import React, { useEffect, useState } from 'react';
import { Input, Button, Space, Form, Modal } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
import { ColSpanType, ColumnProps } from '../filter/column';
import { getFilterName, getOp } from '../filter/utils';
import EntityPicker from '../entityPicker';

import { get, set } from 'oak-domain/lib/utils/lodash';
import { assert } from 'oak-domain/lib/utils/assert';
import Style from './web.module.less';


export default function Render(
    props: WebComponentProps<
        ED,
        keyof ED,
        false,
        {
            entity: keyof ED;
            column: ColumnProps;
            onSearch: () => void;
            formItem: boolean;
        },
        {
            getNamedFilter: (name: string) => Record<string, any>;
            getRefByAttr: (
                entity: keyof ED,
                attr: string
            ) => {
                entity: keyof ED;
                attr: string;
                attrType: string;
                entityI18n: keyof ED;
                attrI18n: string;
                attribute: Record<string, any>;
            };
            getEntityData: (
                entity: keyof ED,
                ids: string[]
            ) => ED[keyof ED]['Schema'][];
        }
    >
) {
    const {
        onSearch,
        entity,
        oakFullpath,
        formItem = true,
        column,
    } = props.data;
    const {
        t,
        refresh,
        getNamedFilter,
        removeNamedFilterByName,
        addNamedFilter,
        getRefByAttr,
        setMessage,
        getEntityData,
    } = props.methods;
    const [open, setOpen] = useState(false);
    const [selectRows, setSelectRows] = useState<
        ED[keyof ED]['Schema'][]
    >([]);

    const {
        op,
        attr,
        label,
        transformValue = (column, filter) => get(filter, getOp(column), ''),
        transformFilter = (column, value) => set({}, getOp(column), value),
        placeholder,
        refProps,
    } = column;
    const name = getFilterName(column);
    const filter = getNamedFilter(name);

    const params = getRefByAttr(entity, attr);
    if (!params) {
        return null;
    }
    const _value = transformValue(column, filter);
    const {
        entity: entity2,
        attr: attr2,
        attrType,
        entityI18n,
        attrI18n,
        attribute,
    } = params;

    if (attribute.type !== 'ref') {
        assert(false, `attr为${attr}，类型【${attribute.type}】不是ref`);
        return null;
    }

    let _label = '';
    if (label && label.indexOf(':') === -1) {
        _label = label;
    } else {
        _label = t(`${entityI18n}:attr.${attrI18n}`);
    }

    const inputKey = refProps?.inputKey || 'name';
    const projection = refProps?.projection || { id: 1, name: 1 };

    let modalProps = {};
    let rows: ED[keyof ED]['Schema'][] = [];
    const multiple = !!op && ['$in', '$nin'].includes(op);
    if (!multiple) {
        modalProps = {
            footer: false,
        };
        rows = _value
            ? getEntityData(attribute.ref as keyof ED, [_value])
            : [];
    } else {
        rows = _value
            ? getEntityData(
                  attribute.ref as keyof ED,
                  _value as string[]
              )
            : [];
    }
    let _value2;
    if (rows.length > 0) {
        _value2 = rows.map((ele) => (ele as any)[inputKey]).join('、');
    }


    const deleteFilter = (interval?: number) => {
        removeNamedFilterByName(name);
    };

    const setFilterAndResetFilter = (
        value?: string | boolean | Array<any>,
        getFilter?: () => any
    ) => {
        if (
            value === '' ||
            value === undefined ||
            value === null ||
            (value as Array<any>)?.length === 0
        ) {
            removeNamedFilterByName(name);
            return;
        }
        const filter2: any =
            typeof getFilter === 'function'
                ? getFilter()
                : transformFilter(column, value);

        addNamedFilter({
            filter: filter2,
            '#name': name,
        });
    };

    let V = (
        <>
            <Input
                placeholder={placeholder || t('placeholder.select')}
                onClick={() => {
                    setOpen(true);
                }}
                // allowClear
                // onChange={() => {
                //     deleteFilter();
                // }}
                value={_value2}
                readOnly={true}
                suffix={
                    _value && (
                        <div
                            onClick={() => {
                                deleteFilter();
                                setSelectRows([]);
                            }}
                        >
                            <CloseOutlined size={14} />
                        </div>
                    )
                }
            />
        </>
    );

    if (formItem) {
        V = <Form.Item label={_label}>{V}</Form.Item>;
    }

    return (
        <>
            {V}
            <Modal
                title={t('select')}
                centered
                open={open}
                onOk={() => {
                    if (selectRows.length === 0) {
                        setMessage({
                            type: 'warning',
                            content: t('select'),
                        });
                        return;
                    }
                    const ids = selectRows.map((ele) => ele.id);
                    setFilterAndResetFilter(ids);
                    setOpen(false);
                }}
                cancelText={t('closed')}
                onCancel={() => setOpen(false)}
                width="50%"
                destroyOnClose={true}
                {...modalProps}
            >
                <EntityPicker
                    multiple={multiple}
                    oakAutoUnmount={true}
                    projection={projection}
                    entity={attribute.ref}
                    oakPath={`$foreignKeyFilter-entity/picker-${entity}`}
                    onSelect={(
                        rows: ED[keyof ED]['Schema'][]
                    ) => {
                        setSelectRows(rows);
                        if (!multiple) {
                            const ids = rows.map((ele) => ele.id);
                            setFilterAndResetFilter(ids[0]);
                            setOpen(false);
                        }
                    }}
                />
            </Modal>
        </>
    );
}
