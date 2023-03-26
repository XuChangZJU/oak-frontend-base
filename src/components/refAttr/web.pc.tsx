import React, { useState } from 'react';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import {
    Checkbox,
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
import { OakAbsRefAttrPickerRender } from '../../types/AbstractComponent';
import { WebComponentProps } from '../../types/Page';
import Picker from '../picker';


type ED = EntityDict & BaseEntityDict;

export default function render(props: WebComponentProps<
    ED,
    keyof EntityDict,
    false,
    {
        entityId: string;
        entityIds: string[];
        multiple: boolean;
        renderValue: string;
        data?: { id: string, title: string }[];
        pickerRender: OakAbsRefAttrPickerRender<ED, keyof ED>;
        onChange: (value: any) => void;
    }
>) {
    const { pickerRender, renderValue, data, multiple, onChange, entityId, entityIds } = props.data;
    const { t } = props.methods;
    const { mode } = pickerRender;
    const [visibile, setVisible] = useState(false);

    if (!data && mode !== 'list') {
        return <div> loading... </div>
    }
    else {
        switch (mode) {
            case 'select': {
                return (
                    <Select
                        value={entityId}
                        onChange={onChange}
                        options={data!.map(
                            ele => ({
                                value: ele.id,
                                label: ele.title,
                            })
                        )}
                        allowClear={!pickerRender.required}
                    ></Select>
                );
            }
            case 'radio': {
                if (multiple) {
                    return (
                        <Checkbox.Group
                            options={data!.map(
                                ele => ({
                                    value: ele.id,
                                    label: ele.title,
                                })
                            )}
                            value={entityIds}
                            onChange={onChange}
                        />
                    );
                }
                return (
                    <Radio.Group
                        onChange={({ target }) => onChange(target.value)}
                        value={entityId}
                        options={data!.map(
                            ele => ({
                                value: ele.id,
                                label: ele.title,
                            })
                        )}
                    >
                    </Radio.Group>
                );
            }
            case 'list': {
                const { entity, projection, title, titleLabel, filter, sorter, required } = pickerRender;
                const p = typeof projection === 'function' ? projection() : projection;
                const f = typeof filter === 'function' ? filter() : filter;
                const s = typeof sorter === 'function' ? sorter() : sorter;
                return (
                    <Space>
                        <Input
                            value={renderValue}
                            allowClear={!required}
                            onClick={() => setVisible(true)}
                            onChange={({ currentTarget }) => {
                                if (!currentTarget.value) {
                                    onChange(undefined);
                                }
                            }}                            
                        />
                        <Modal
                            title={`选择${t(`${pickerRender.entity}:name`)}`}
                            open={visibile}
                            closable={true}
                            onCancel={() => setVisible(false)}
                            destroyOnClose={true}
                            footer={null}
                        >
                            <Picker
                                oakPath={`$refAttr-picker-${entity}`}
                                entity={entity as string}
                                title={title}
                                titleLabel={titleLabel}
                                oakProjection={p}
                                oakFilters={f ? [f] : undefined}
                                oakSorters={s}
                                onSelect={([{ id }]: [{ id: string}]) => {
                                    onChange(id);
                                    setVisible(false);
                                }}
                            />
                        </Modal>
                    </Space>
                );
            }
        }
    }
}