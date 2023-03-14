import React from 'react';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import {
    Form,
    Input,
    InputNumber,
    Radio,
    Modal,
    Button,
    DatePicker,
    Space,
    Cascader,
    Select,
    Tag,
    Switch,
} from 'antd';
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
const { TextArea } = Input;
import dayjs from 'dayjs';
import { AttrRender, AttrUpsertRender, OakAbsRefAttrPickerRender, OakNativeAttrUpsertRender } from '../../types/AbstractComponent';
import { WebComponentProps } from '../../types/Page';
import assert from 'assert';
import EntityPicker from '../picker';

type ED = EntityDict & BaseEntityDict;
function makeAttrInput(
    attrRender: AttrUpsertRender<ED>,
    onValueChange: (value: any) => void,
    mtoData: Record<string, Array<{
        id: string;
        title: string;
    }>>,
    openPicker: (attr: string) => void,
    closePicker: () => void) {
    const { value, type, params, label, defaultValue, required } = attrRender as OakNativeAttrUpsertRender;
    switch (type) {
        case 'string':
        case 'varchar':
        case 'char': {
            return (
                <Input
                    allowClear={!required}
                    placeholder={`请输入${label}`}
                    value={value}
                    defaultValue={defaultValue}
                    maxLength={params && params.length}
                    onChange={({ target: { value } }) => {
                        onValueChange(value);
                    }}
                />
            );
        }
        case 'text': {
            return (
                <TextArea
                    allowClear={!required}
                    placeholder={`请输入${label}`}
                    defaultValue={defaultValue}
                    value={value}
                    rows={6}
                    maxLength={params && params.length || 1000}
                    onChange={({ target: { value } }) => {
                        onValueChange(value);
                    }}
                />
            );
        }
        case 'int': {
            const SIGNED_THRESHOLDS = {
                1: [-128, 127],
                2: [-32768, 32767],
                4: [-2147483648, 2147483647],
                8: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
            };
            const UNSIGNED_THRESHOLDS = {
                1: [0, 255],
                2: [0, 65535],
                4: [0, 4294967295],
                8: [0, Number.MAX_SAFE_INTEGER],
            };
            const width = (params?.width || 4) as 4;
            const min = params?.min !== undefined ? params.min : (params?.signed ? SIGNED_THRESHOLDS[width][0] : UNSIGNED_THRESHOLDS[width][0]);
            const max = params?.max !== undefined ? params.max : (params?.signed ? SIGNED_THRESHOLDS[width][1] : UNSIGNED_THRESHOLDS[width][1]);

            return (
                <InputNumber
                    min={min}
                    max={max}
                    keyboard={true}
                    defaultValue={defaultValue}
                    value={value}
                    precision={0}
                    onChange={(value) => onValueChange(value)}
                />
            );
        }
        case 'decimal': {
            const precision = params?.precision || 10;
            const scale = params?.scale || 0;
            const threshold = Math.pow(10, precision - scale);
            const scaleValue = Math.pow(10, 0 - scale);
            const max = threshold - scaleValue;     // 小数在这里可能会有bug
            const min = 0 - max;


            return (
                <InputNumber
                    min={min}
                    max={max}
                    keyboard={true}
                    defaultValue={defaultValue}
                    value={value}
                    precision={scale}
                    step={scaleValue}
                    onChange={(value) => onValueChange(value)}
                />
            );
        }
        case 'money': {
            // money在数据上统一用分来存储
            const valueShowed = parseFloat((value / 100).toFixed(2));
            const defaultValueShowed = parseFloat((defaultValue / 100).toFixed(2));
            return (
                <InputNumber
                    min={0}
                    keyboard={true}
                    defaultValue={defaultValueShowed}
                    value={valueShowed}
                    precision={2}
                    step={0.01}
                    addonAfter="￥"
                    onChange={(value) => {
                        if (value !== null) {
                            const v2 = Math.round(value * 100);
                            onValueChange(v2);
                        }
                        else {
                            onValueChange(value);
                        }
                    }}
                />
            );
        }
        case 'datetime':
        case 'date':
        case 'time': {
            const mode = type === 'time' ? 'time' : 'date';
            return (
                <DatePicker
                    allowClear={!required}
                    showTime={type === 'datetime'}
                    placeholder={`请选择${label}`}
                    format="YYYY-MM-DD HH:mm:ss"
                    mode={mode}
                    value={dayjs(value)}
                    onChange={(value) => {
                        if (value) {
                            onValueChange(value.valueOf());
                        }
                        else {
                            onValueChange(null);
                        }
                    }}
                />
            );
        }
        case 'boolean': {
            return (
                <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    checked={value}
                    onChange={(checked) => {
                        onValueChange(checked);
                    }}
                />
            );
        }
        case 'enum': {
            const { enumeration } = attrRender as OakNativeAttrUpsertRender;;
            return (
                <Radio.Group
                    value={value}
                    onChange={({ target }) => onValueChange(target.value)}
                >
                    {
                        enumeration!.map(
                            ({ label, value }) => (
                                <Radio value={value}>{label}</Radio>
                            )
                        )
                    }
                </Radio.Group>
            );
        }
        case 'ref': {
            const { mode, attr, renderValue } = attrRender as OakAbsRefAttrPickerRender<ED, keyof ED>;
            switch (mode) {
                case 'radio': {
                    const data = mtoData[attr];
                    if (data) {
                        return (
                            <Radio.Group onChange={({ target}) => onValueChange(target.value)} value={value}>
                                {
                                    data.map(
                                        ele => (<Radio value={ele.id}>{ele.title}</Radio>)
                                    )
                                }
                            </Radio.Group>
                        );
                    }
                    else {
                        return <div>loading</div>
                    }
                }
                case 'select': {
                    const data = mtoData[attr];
                    if (data) {
                        return (
                            <Select
                                value={value}
                                onChange={onValueChange}
                                style={{ width: '40%' }}
                                options={data.map(
                                    ele => ({
                                        value: ele.id,
                                        label: ele.title,
                                    })
                                )}
                                allowClear
                            ></Select>
                        );
                    }
                    else {
                        return <div>loading</div>
                    }
                }
                case 'list': {
                    return (
                        <Space>
                            <div>{renderValue}</div>
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<EditOutlined />}
                                onClick={() => openPicker(attr)}
                            />
                        </Space>
                    );
                }
                default: {
                    assert(false, `暂不支持的mode「${mode}」`);
                }
            }

        }
        default: {
            throw new Error(`【Abstract Update】无法支持的数据类别${type}的渲染`);
        }
    }
}

export default function render(props: WebComponentProps<
    ED,
    keyof EntityDict,
    false,
    {
        renderData: AttrUpsertRender<ED>[];
        children: any;
        mtoData: Record<string, Array<{
            id: string;
            title: string;
        }>>;
        pickerEntity?: keyof ED;
        pickerProjection?: ED[keyof ED]['Selection']['data'];
        pickerFilter?: ED[keyof ED]['Selection']['filter'];
        pickerTitleFn?: (data: any) => string;
        pickerTitleLabel?: string;
        pickerAttr?: string;
        pickerDialogTitle?: string;
    },
    {
        refreshData: (attr: string) => void;
        openPicker: (attr: string) => void;
        closePicker: () => void;
    }
>) {
    const { renderData = [], children, mtoData, pickerEntity, pickerAttr, pickerDialogTitle,
        pickerProjection, pickerFilter, oakFullpath, pickerTitleFn, pickerTitleLabel } = props.data;
    const { update, refreshData, openPicker, closePicker } = props.methods;
    return (
        <>
            <Form
                labelCol={{ span: 4 }}
                layout="horizontal"
                style={{
                    margin: '0px auto',
                    maxWidth: 675,
                }}
            >
                {
                    renderData.map(
                        (ele) => (
                            <Form.Item
                                label={ele.label}
                                rules={[
                                    {
                                        required: ele.required,
                                    },
                                ]}
                            >
                                <>
                                    {
                                        makeAttrInput(ele, (value) => {
                                            const { attr } = ele;
                                            update({
                                                [attr]: value,
                                            })
                                        }, mtoData, openPicker, closePicker)
                                    }
                                </>
                            </Form.Item>
                        )
                    )
                }
                {
                    children
                }
            </Form>
            <Modal
                title={pickerDialogTitle}
                open={!!pickerEntity}
                closable={true}
                onCancel={closePicker}
                destroyOnClose={true}
                footer={null}
            >
                <EntityPicker
                    oakPath={`$${oakFullpath}-entityPicker`}
                    entity={pickerEntity as string}
                    oakProjection={pickerProjection}
                    oakFilters={[{ filter: pickerFilter }]}
                    title={pickerTitleFn!}
                    titleLabel={pickerTitleLabel}
                    onSelect={(value: any) => {
                        const [{ id }] = value;
                        update({
                            [pickerAttr!]: id,
                        });
                        closePicker();
                    }}
                />
            </Modal>
        </>
    );
}