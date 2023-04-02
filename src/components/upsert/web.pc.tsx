import React, { useState } from 'react';
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
    Switch,
} from 'antd';
import OakIcon from '../icon';
const { TextArea } = Input;
import dayjs from 'dayjs';
import { AttrUpsertRender, OakAbsRefAttrPickerRender, OakAbsNativeAttrUpsertRender } from '../../types/AbstractComponent';
import { WebComponentProps } from '../../types/Page';
import RefAttr from '../refAttr';
import Location, { Poi } from '../map/location';
import Map from '../map/map';

type ED = EntityDict & BaseEntityDict;
function makeAttrInput(attrRender: AttrUpsertRender<ED>, onValueChange: (value: any, extra?: Record<string, any>) => void) {
    const [sl, setSl] = useState(false);
    const [poi, setPoi] = useState<{
        poiName: string;
        coordinate: [number, number];
        areaId: string;
    } | undefined>(undefined);
    const { value, type, label, params, defaultValue, enumeration, required, placeholder, min, max, maxLength } = attrRender as OakAbsNativeAttrUpsertRender<ED, keyof ED, keyof ED[keyof ED]['OpSchema']>;
    switch (type) {
        case 'string':
        case 'varchar':
        case 'char':
        case 'poiName': {
            return (
                <Input
                    allowClear={!required}
                    placeholder={placeholder || `请输入${label}`}
                    value={value}
                    defaultValue={defaultValue}
                    maxLength={maxLength}
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
                    maxLength={maxLength || 1000}
                    onChange={({ target: { value } }) => {
                        onValueChange(value);
                    }}
                />
            );
        }
        case 'int': {
            /* const SIGNED_THRESHOLDS = {
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
            }; */
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
            const scaleValue = Math.pow(10, 0 - scale);
            /* 
            const threshold = Math.pow(10, precision - scale);
            const max = threshold - scaleValue;     // 小数在这里可能会有bug
            const min = 0 - max; */
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
                    placeholder={placeholder}
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
                    checkedChildren={<OakIcon name="right" />}
                    unCheckedChildren={<OakIcon name="close" />}
                    checked={value}
                    onChange={(checked) => {
                        onValueChange(checked);
                    }}
                />
            );
        }
        case 'enum': {
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
            return (
                <RefAttr
                    multiple={false}
                    entityId={value}
                    pickerRender={attrRender as OakAbsRefAttrPickerRender<ED, keyof ED>}
                    onChange={(value: string) => { onValueChange(value) }}
                />
            );
        }
        case 'coordinate': {
            const { coordinate } = value || {};
            const { extra } = attrRender as OakAbsNativeAttrUpsertRender<ED, keyof ED, keyof ED[keyof ED]['OpSchema']>;
            const poiNameAttr = extra?.poiName || 'poiName';
            const areaIdAttr = extra?.areaId || 'areaId';
            return (
                <>
                    <Modal
                        width='80vw'
                        open={sl}
                        closable={false}
                        onCancel={() => setSl(false)}
                        okText="确认"                        
                        cancelText="取消"
                        okButtonProps={{
                            disabled: !poi,
                        }}
                        onOk={() => {
                            if (poi) {
                                const { poiName, coordinate, areaId } = poi;
                                onValueChange({
                                    type: 'point',
                                    coordinate,
                                }, {
                                    [poiNameAttr]: poiName,
                                    [areaIdAttr]: areaId,
                                });
                            }
                            setSl(false);
                        }}
                    >
                        <Location
                            coordinate={coordinate}
                            onLocated={(poi) => setPoi(poi)}
                        />
                    </Modal>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                        }}
                    >
                        <Space direction="vertical" size={8}>
                            <Space align="center">
                                <Button
                                    type="dashed"
                                    onClick={() => {
                                        setSl(true);
                                    }}
                                >
                                    {value
                                        ? '重选位置'
                                        : '选择位置'}
                                </Button>
                            </Space>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: '100%',
                                }}
                            >
                                <Map
                                    undragable={true}
                                    disableWheelZoom={true}
                                    style={{ height: 300 }}
                                    autoLocate={true}
                                    center={coordinate}
                                    markers={coordinate ? [coordinate] : undefined}
                                />
                            </div>
                        </Space>
                    </div>
                </>
            );
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
        helps?: Record<string, string>;
        layout?: 'horizontal' | 'vertical';
        children: any;      // 暂时没用
    }
>) {
    const { renderData = [], helps } = props.data;
    const { update } = props.methods;
    return (
        <Form
            labelCol={{ span: 4 }}
            layout="horizontal"
            style={{
                margin: '0px auto',
                maxWidth: '100%',
            }}
        >
            {
                renderData.map(
                    (ele) => (
                        <Form.Item
                            label={ele.label}
                            rules={[
                                {
                                    required: !!ele.required,
                                },
                            ]}
                            help={helps && helps[ele.attr]}
                        >
                            <>
                                {
                                    makeAttrInput(ele, (value, extra) => {
                                        const { attr } = ele;
                                        update({
                                            [attr]: value,
                                            ...extra,
                                        })
                                    })
                                }
                            </>
                        </Form.Item>
                    )
                )
            }
        </Form>
    );
}