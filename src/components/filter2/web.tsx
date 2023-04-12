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
import { ED, OakAbsRefAttrPickerDef, OakAbsRefAttrPickerRender } from '../../types/AbstractComponent';
import { initinctiveAttributes } from 'oak-domain/lib/types/Entity';
import dayjs, { Dayjs } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import type { DatePickerProps, RangePickerProps } from 'antd/es/date-picker';

dayjs.extend(weekday);
dayjs.extend(localeData);

import { get, set } from 'oak-domain/lib/utils/lodash'
import { assert } from 'oak-domain/lib/utils/assert';

import { ColumnProps, ColSpanType, Ops, ValueType, ViewType } from '../../types/Filter';
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
            viewType: ViewType | undefined;
            searchValue: string;
            entityI18n: keyof ED2;
            attrI18n: string;
            options: { value: string | boolean }[];
            isCommonI18n: boolean;
            onSearch: () => void;
        },
        {
            getNamedFilter: (name: string) => Record<string, any>;
            setFilterAndResetFilter: (viewType: ViewType, value?: ValueType) => void;
        }
    >
) {
    const { entity, column, oakFullpath, viewType, options, attrI18n, entityI18n, isCommonI18n } = props.data;
    const {
        t,
        addNamedFilter,
        removeNamedFilterByName,
        refresh,
        getNamedFilter,
        setFilterAndResetFilter,
    } = props.methods;
    const name = getFilterName(column);
    const filter = getNamedFilter(name);

    const {
        op,
        attr,
        placeholder,
        label: _label,
    } = column;
    // ready中根据attrType判断得到的viewType,不存在viewType直接返回null
    if (!viewType) {
        return null;
    }
    // 拼接过滤项的label
        let label = _label;
        if (isCommonI18n) {
            label = t(`common:${attrI18n}`)
        }
        else {
            label = t(`${entityI18n as string}:attr.${attrI18n}`)
        }
    let V;
    switch (viewType) {
        case 'Input': {
            V = (<Input
                placeholder={placeholder || t('placeholder.input')}
                onChange={(e) => {
                    const val = e.target.value;
                    setFilterAndResetFilter(viewType, val);
                }}
                allowClear
                onPressEnter={() => { }}
            />);
            break;
        };
        case 'Select': {
            const options2 = options.map((ele) => ({
                label: typeof ele.value === 'boolean' ? t(`${ele.value ? 'tip.yes' : 'tip.no'}`)
                    : t(`${entityI18n as string}:v.${attrI18n}.${ele.value}`),
                value: ele.value,
            }))
            V = (
                <Select
                    mode={['$in', '$nin'].includes(op || '') ? 'multiple' : undefined}
                    allowClear
                    placeholder={placeholder || t('placeholder.select')}
                    onChange={(value) => {
                        setFilterAndResetFilter(viewType, value);
                    }}
                    options={options2}
                    onClear={() => {
                        removeNamedFilterByName(name);
                    }}
                />
            );
            break;
        }
        case 'DatePicker': {
            const { dateProps } = column;
            const { showTime = false } = dateProps || {};
            assert(op, '选择时间，算子必须传入');
            const unitOfTime = 'day';
            V = (
                <DatePicker
                    style={{width: '100%'}}
                    format="YYYY-MM-DD"
                    showTime={showTime}
                    onChange={(date, dateString) => {
                        setFilterAndResetFilter(viewType, date);
                    }}
                />
            )
            break;
        };
        case 'DatePicker.RangePicker': {
            const { dateProps } = column;
            const { showTime = false } = dateProps || {};
            V = (
                <DatePicker.RangePicker
                    style={{width: '100%'}}
                    showTime={showTime}
                    onChange={(dates, dateStrings) => {
                        setFilterAndResetFilter(viewType, dates as Dayjs[]);
                    }}
                />
            )
        }
        case 'RefAttr': {
            const ops: Ops[] = ['$in', '$nin', '$eq', '$ne'];
            const filter = getNamedFilter(name);
            const value = get(filter, getOp2(column, '$search'), '')
            V = (
                <RefAttr
                    multiple={['$in', '$nin'].includes(op || '')}
                    entityIds={[value]}
                    pickerRender={Object.assign({}, column.refProps, {
                        label: 'todotodo',
                    }) as OakAbsRefAttrPickerRender<ED, keyof ED>}
                    onChange={(ids) => { console.log(ids, '这里等测试到了再写(Xc)') }}
                />
            );
            break;
        }
    }

    return (
        <Form.Item label={label} name={name}>
            <>{V}</>
        </Form.Item>
    );
}


function assertMessage(attr: string, attrType: string, op: Ops, ops: Ops[]) {
    return `attr为【${attr}】, 传入的算子【${op}】不支持，类型【${attrType}】只支持【${JSON.stringify(
        ops
    )}】`;
}
