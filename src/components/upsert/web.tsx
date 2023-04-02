import React, { useState } from 'react';
import {
    Space,
    Form,
    Input,
    TextArea,
    DatePicker,
    Grid,
    Popup,
    Radio,
    Stepper,
    Switch,
    Button,
} from 'antd-mobile';
import OakIcon from '../icon';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';

type ED = EntityDict & BaseEntityDict;
import { WebComponentProps } from '../../types/Page';
import RefAttr from '../refAttr';
import Location, { Poi } from '../map/location';
import Map from '../map/map';
import dayjs from 'dayjs';
import { AttrUpsertRender, OakAbsRefAttrPickerRender, OakAbsNativeAttrUpsertRender } from '../../types/AbstractComponent';

function makeAttrInput(
    attrRender: AttrUpsertRender<ED>,
    onValueChange: (value: any, extra?: Record<string, any>) => void,
    t: (word: string) => string) {
    const [sl, setSl] = useState(false);
    const [dt, setDt] = useState(false);
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
                    clearable={!required}
                    placeholder={placeholder || `请输入${label}`}
                    value={value}
                    defaultValue={defaultValue}
                    maxLength={maxLength}
                    onChange={(value) => {
                        onValueChange(value);
                    }}
                />
            );
        }
        case 'text': {
            return (
                <TextArea
                    autoSize={true}
                    placeholder={`请输入${label}`}
                    defaultValue={defaultValue}
                    value={value || ''}
                    rows={6}
                    showCount={true}
                    maxLength={maxLength || 1000}
                    onChange={(value) => {
                        onValueChange(value);
                    }}
                />
            );
        }
        case 'int': {
            return (
                <Stepper
                    min={min}
                    max={max}
                    defaultValue={defaultValue}
                    value={value}
                    digits={0}
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
                <Stepper
                    min={min}
                    max={max}
                    defaultValue={defaultValue}
                    value={value}
                    digits={scale}
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
                <Stepper
                    min={0}
                    defaultValue={defaultValueShowed}
                    value={valueShowed}
                    digits={2}
                    step={0.01}
                    formatter={value => `￥ ${value}`}
                    parser={text => parseFloat(text.replace('￥', ''))}
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
        case 'date': {
            const precision = type === 'date' ? 'day' : 'second';
            const format = type === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss';
            return (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <DatePicker
                        visible={dt}
                        onClose={() => setDt(false)}
                        precision={precision}
                        value={new Date(value)}
                        defaultValue={new Date()}
                        min={min ? new Date(min) : undefined}
                        max={max ? new Date(max) : undefined}
                    >
                        {value => dayjs(value).format(format)}
                    </DatePicker>
                    <Button
                        onClick={() => setDt(true)}
                    >
                        {type === 'date' ? t('chooseDate') : t('chooseDatetime')}
                    </Button>
                </div>
            );
        }
        case 'time': {
            return (
                <div>待实现</div>
            );
        }
        case 'boolean': {
            return (
                <Switch
                    checkedText={<OakIcon name="right" />}
                    uncheckedText={<OakIcon name="close" />}
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
                    onChange={(value) => onValueChange(value)}
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
                    <Popup
                        closeOnMaskClick={true}
                        destroyOnClose={true}
                        position='bottom'
                        visible={sl}
                        onClose={() => setSl(false)}
                        bodyStyle={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <Location
                                coordinate={coordinate}
                                onLocated={(poi) => setPoi(poi)}
                            />
                        </div>
                        <Grid columns={2} gap={8}>
                            <Button
                                block
                                color="primary"
                                disabled={!poi}
                                onClick={() => {
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
                                {t('common:action.confirm')}
                            </Button>
                            <Button
                                block
                                fill="outline"
                                onClick={() => {
                                    setSl(false);
                                }}
                            >
                                {t('common:action.cancel')}
                            </Button>
                        </Grid>
                    </Popup>
                    <div
                        style={{
                            display: 'flex',
                            width: '100%',
                            alignItems: 'center',
                        }}
                        onClick={() => setSl(true)}
                    >
                        <Map
                            undragable={true}
                            unzoomable={true}
                            zoom={13}
                            disableWheelZoom={true}
                            style={{ height: 200, flex: 1 }}
                            autoLocate={true}
                            center={coordinate}
                            markers={coordinate ? [coordinate] : undefined}
                        />
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
        mode?: 'default' | 'card';
        children: any;      // 暂时没用
    }
>) {
    const { renderData = [], helps, layout = 'horizontal', mode = 'default' } = props.data;
    const { update, t } = props.methods;
    return (
        <Form
            layout={layout}
            mode={mode}
        >
            {
                renderData.map(
                    (ele) => {
                        return (
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
                                        }, t)
                                    }
                                </>
                            </Form.Item>
                        )
                    }
                )
            }
        </Form>
    );
}