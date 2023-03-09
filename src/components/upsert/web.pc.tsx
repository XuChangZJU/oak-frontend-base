import React from 'react';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import {
    Form,
    Input,
    InputNumber,
    Radio,
    Button,
    DatePicker,
    Space,
    Cascader,
    Select,
    Tag,
} from 'antd';
const { TextArea } = Input;
import dayjs, { Dayjs } from 'dayjs';
import { AttrRender } from '../../types/AbstractComponent';
import { WebComponentProps } from '../../types/Page';

function makeAttrInput(attrRender: AttrRender, onValueChange: (value: any) => void) {
    const { value, type, params, ref, label, defaultValue } = attrRender;
    switch (type) {
        case 'string': {
            return (
                <Input
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
            const max = Math.pow(10, precision - scale);
            const min = 0;
            
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
    }
}

export default function render(props: WebComponentProps<
    EntityDict & BaseEntityDict,
    keyof EntityDict,
    false,
    {
        renderData: AttrRender[];
    },
    {
    }
>) {
    const { renderData } = props.data;
    return (
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

                        </Form.Item>
                    )
                )
            }
        </Form>
    );
}