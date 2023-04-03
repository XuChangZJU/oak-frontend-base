import React, { useEffect } from 'react';
import {
    Input,
    Button,
    Space,
    Form,
    Select,
    DatePicker,
    InputNumber,
} from 'antd';
import { WebComponentProps } from '../../types/Page';
import { ToYuan, ToCent } from 'oak-domain/lib/utils/money';
import { ED, OakAbsRefAttrPickerDef } from '../../types/AbstractComponent';
import { initinctiveAttributes } from 'oak-domain/lib/types/Entity';
import dayjs, { Dayjs } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import type { DatePickerProps, RangePickerProps } from 'antd/es/date-picker';

dayjs.extend(weekday);
dayjs.extend(localeData);

import { get, set } from 'oak-domain/lib/utils/lodash'
import { assert } from 'oak-domain/lib/utils/assert';

import { ColumnProps, ColSpanType, Ops, ValueType } from '../../types/Filter';
import { getFilterName, getOp, getOp2 } from './utils';
import RefAttr from '../refAttr';

export default function Render<ED2 extends ED>(
    props: WebComponentProps<
        ED2,
        keyof ED2,
        false,
        {
            entity: keyof ED2;
            column: ColumnProps<ED2, keyof ED2>;
            searchValue: string;
            onSearch: () => void;
        },
        {
            getNamedFilter: (name: string) => Record<string, any>;
            getRefByAttr: <T extends keyof ED2>(
                entity: T,
                attr: keyof ED2[T]['OpSchema']
            ) => {
                entity: keyof ED2
                attr: string;
                attrType: string;
                entityI18n: keyof ED2;
                attrI18n: string;
                attribute: Record<string, any>
            };
        }
    >
) {
    const { entity, column, oakFullpath } = props.data;
    const {
        t,
        addNamedFilter,
        removeNamedFilterByName,
        refresh,
        getNamedFilter,
        getRefByAttr,
    } = props.methods;
    const name = getFilterName(column);
    const filter = getNamedFilter(name);

    const {
        op,
        attr,
        label,
        transformValue = (column, filter) => get(filter, getOp(column), ''),
        transformFilter = (column, value) => set({}, getOp(column), value),
        placeholder,
    } = column;
    const params = getRefByAttr(entity, attr);
    if (!params) {
        return null;
    }
    const {
        entity: entity2,
        attr: attr2,
        attrType,
        entityI18n,
        attrI18n,
        attribute,
    } = params;

    let _label = '';
    if (label && label.indexOf(':') === -1) {
        _label = label;
    }
    else if (['$text'].includes(attr2)) {
        _label = t(`attr.${attr2}`);
    } else if (initinctiveAttributes.includes(attr2)) {
        _label = t(`attr.${attr2}`);
    } else {
        _label = t(`${entityI18n as string}:attr.${attrI18n}`);
    }

    const deleteFilter = (interval?: number) => {
        removeNamedFilterByName(name);
    };

    const setFilterAndResetFilter = (
        value?: ValueType,
        getFilter?: () => any
    ) => {
        if (
            value === '' ||
            value === undefined ||
            value === null ||
            (value as Array<Dayjs>)?.length === 0
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


    let V;

    if (attrType === '$text') {
        const ops: Ops[] = ['$search'];
        if (op) {
            assert(ops.includes(op), assertMessage(attr as string, attrType, op, ops));
        }
        const {
            transformFilter = (column, value) => {
                return set({}, getOp2(column, '$search'), value);
            },
            transformValue = (column, filter) => get(filter, getOp2(column, '$search'), ''),
        } = column;
        const _value = transformValue(column, filter);

        return (
            <Form.Item label={_label}>
                <>
                    <Input
                        placeholder={placeholder || t('placeholder.input')}
                        value={_value}
                        onChange={(e) => {
                            const val = e.target.value;
                            setFilterAndResetFilter(val, () => {
                                return transformFilter(column, val);
                            });
                        }}
                        allowClear
                        onPressEnter={() => { }}
                    />
                </>
            </Form.Item>
        );
    }
    const _value = transformValue(column, filter);

    switch (attrType) {
        case 'money': {
            const ops: Ops[] = ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte'];
            const moneyVal = _value ? ToYuan(_value) : '';
            V = (
                <Input
                    placeholder={placeholder || t('placeholder.input')}
                    value={moneyVal}
                    onChange={(e) => {
                        const val = e.target.value;
                        const val2 =
                            /^(-?[1-9]\d*(\.\d*[1-9])?)|(-?0\.\d*[1-9])$/.test(
                                val
                            ) ? ToCent(Number(val)) : moneyVal;
                        setFilterAndResetFilter(val2);
                    }}
                    allowClear
                    onPressEnter={() => { }}
                />
            );
            break;
        }
        case 'float': {
            const ops: Ops[] = ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte'];
            V = (
                <Input
                    placeholder={placeholder || t('placeholder.input')}
                    value={_value}
                    onChange={(e) => {
                        const val = e.target.value;
                        setFilterAndResetFilter(val);
                    }}
                    allowClear
                    onPressEnter={() => { }}
                />
            );
            break;
        }
        case 'integer':
        case 'int': {
            const ops: Ops[] = ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte'];
            if (op) {
                assert(
                    ops.includes(op),
                    assertMessage(attr as string, attrType, op, ops)
                );
            }
            V = (
                <Input
                    placeholder={placeholder || t('placeholder.input')}
                    value={_value}
                    onChange={(e) => {
                        const val = e.target.value;
                        setFilterAndResetFilter(val);
                    }}
                    allowClear
                    onPressEnter={() => { }}
                />
            );
            break;
        }
        case 'char':
        case 'varchar': {
            const ops: Ops[] = [
                '$eq',
                '$ne',
                '$endsWith',
                '$includes',
                '$startsWith',
            ];
            if (op) {
                assert(
                    ops.includes(op),
                    assertMessage(attr as string, attrType, op, ops)
                );
            }
            V = (
                <Input
                    placeholder={placeholder || t('placeholder.input')}
                    value={_value}
                    onChange={(e) => {
                        const val = e.target.value;
                        setFilterAndResetFilter(val);
                    }}
                    allowClear
                    onPressEnter={() => { }}
                />
            );
            break;
        }
        case 'boolean': {
            let text2;
            switch (_value) {
                case true: {
                    text2 = t('tip.yes');
                    break;
                }
                case false: {
                    text2 = t('tip.no');
                    break;
                }
                default: {
                    text2 = t('tip.unselected');
                    break;
                }
            }
            V = (
                <Button
                    onClick={() => {
                        let val: any;
                        if (_value === true) {
                            val = false;
                        } else if (_value === false) {
                            val = '';
                        } else {
                            val = true;
                        }
                        setFilterAndResetFilter(val);
                    }}
                >
                    {text2}
                </Button>
            );
            break;
        }
        case 'enum': {
            const ops: Ops[] = ['$in', '$nin', '$eq', '$ne'];
            if (op) {
                assert(
                    ops.includes(op),
                    assertMessage(attr as string, attrType, op, ops)
                );
            }

            const enumeration = attribute?.enumeration;
            const { selectProps } = column;

            const {
                options,
                transformInOption = (
                    option: string | number | Record<string, any>
                ) => (typeof option === 'object' ? option.value : option), // 根据
                transformOutOption = (
                    option: string | number | Record<string, any>
                ) => (typeof option === 'object' ? option.label : option), // 根据
            } = selectProps || {};

            const options2 =
                options ||
                enumeration?.map((ele: string) => ({
                    label: t(`${entityI18n as string}:v.${attrI18n}.${ele}`),
                    value: ele,
                }));

            if (op && ['$in', '$nin'].includes(op)) {
                const {
                    transformValue = (column, filter) =>
                        get(filter, getOp(column), []),
                } = column;
                const selectValue = transformValue(column, filter);
                V = (
                    <Select
                        mode="multiple"
                        allowClear
                        placeholder={placeholder || t('placeholder.select')}
                        value={selectValue}
                        onChange={(value) => {
                            setFilterAndResetFilter(value);
                        }}
                        options={options2?.length > 0 ? options2 : []}
                        onClear={() => {
                            deleteFilter();
                        }}
                    />
                );
            } else {
                V = (
                    <Select
                        allowClear
                        placeholder={placeholder || t('placeholder.select')}
                        value={_value}
                        onChange={(value) => {
                            setFilterAndResetFilter(value);
                        }}
                        options={options2?.length > 0 ? options2 : []}
                        onClear={() => {
                            deleteFilter();
                        }}
                    />
                );
            }

            break;
        }
        case 'datetime': {
            const { dateProps } = column;
            const { range = false, showTime = false } = dateProps || {};

            const unitOfTime = 'day';

            if (range) {
                const ops: Ops[] = ['$between'];
                assert(op, '选择时间范围，算子必须传入');
                assert(
                    ops.includes(op),
                    assertMessage(attr as string, attrType, op, ops)
                );
                const {
                    transformValue = (column, filter) => {
                        return get(filter, `${getOp(column)}`, []);
                    },
                    transformFilter = (column, value: Dayjs[]) => {
                        const startTime = dayjs(value[0])
                            .startOf(unitOfTime)
                            .valueOf();
                        const endTime = dayjs(value[1])
                            .endOf(unitOfTime)
                            .valueOf();

                        return set({}, getOp(column), [startTime, endTime]);
                    },
                } = column;
                const dateValues = transformValue(column, filter);
                const [startTime, endTIme] = dateValues;
                V = (
                    <DatePicker.RangePicker
                        showTime={showTime}
                        value={
                            [
                                startTime ? dayjs(startTime) : '',
                                endTIme ? dayjs(endTIme) : '',
                            ] as RangePickerProps['value']
                        }
                        onChange={(dates, dateStrings) => {
                            setFilterAndResetFilter(dates as Dayjs[], () => {
                                return transformFilter(
                                    column,
                                    dates as Dayjs[]
                                );
                            });
                        }}
                    />
                );
            } else {
                const ops: Ops[] = ['$between', '$gt', '$gte', '$lt', '$lte'];
                if (op) {
                    assert(
                        ops.includes(op),
                        assertMessage(attr as string, attrType, op, ops)
                    );
                }
                const {
                    transformFilter = (column, value: Dayjs) => {
                        const startTime = dayjs(value)
                            .startOf(unitOfTime)
                            .valueOf();
                        const endTime = dayjs(value)
                            .endOf(unitOfTime)
                            .valueOf();
                        if (column.op === '$between') {
                            const values2 = [startTime, endTime];
                            return set({}, getOp(column), values2);
                        }
                        if (column.op === '$gt' || column.op === '$gte') {
                            return set({}, getOp(column), startTime);
                        }
                        if (column.op === '$lt' || column.op === '$lte') {
                            return set({}, getOp(column), endTime);
                        }

                        return set({}, getOp(column), dayjs(value).valueOf());
                    },
                    transformValue = (column, filter) => {
                        if (column.op === '$between') {
                            return get(filter, `${getOp(column)}.0`, null);
                        }
                        return get(filter, getOp(column), null);
                    },
                } = column;
                const dateValue = transformValue(column, filter);

                V = (
                    <DatePicker
                        format="YYYY-MM-DD"
                        showTime={showTime}
                        value={dateValue ? dayjs(dateValue) : null}
                        onChange={(date, dateString) => {
                            setFilterAndResetFilter(date as Dayjs, () => {
                                return transformFilter(column, date as Dayjs);
                            });
                        }}
                    />
                );
            }

            break;
        }
        case 'ref': {
            const ops: Ops[] = ['$in', '$nin', '$eq', '$ne'];
            if (op) {
                assert(
                    ops.includes(op),
                    assertMessage(attr as string, attrType, op, ops)
                );
            }
            if (op && ['$in', '$nin'].includes(op)) {
                V = (
                    <RefAttr
                        multiple={true}
                        entityIds={[_value]}
                        pickerRender={Object.assign({}, column.refProps, {
                            value: [_value],
                        })}
                        onChange={(ids: string[]) => { console.log(ids, '这里等测试到了再写(Xc)') }}
                    />
                );
            }
            else {
                V = (
                    <RefAttr
                        multiple={false}
                        entityId={_value}
                        pickerRender={Object.assign({}, column.refProps, {
                            value: _value,
                        })}
                        onChange={(id: string) => { console.log(id, '这里等测试到了再写(Xc)') }}
                    />
                );
            }
            break;
        }
        default: {
            assert(false, `类型【${attrType}】暂不支持`);
            break;
        }
    }

    return (
        <Form.Item label={_label}>
            <>{V}</>
        </Form.Item>
    );
}


function assertMessage(attr: string, attrType: string, op: Ops, ops: Ops[]) {
    return `attr为【${attr}】, 传入的算子【${op}】不支持，类型【${attrType}】只支持【${JSON.stringify(
        ops
    )}】`;
}
