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
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { OakAbsRefAttrPickerDef, OakNativeAttrUpsertRender } from '../../types/AbstractComponent';
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
        pickerDef: OakAbsRefAttrPickerDef<ED, keyof ED>;
        onChange: (value: any) => void;
    }
>) {
    const { pickerDef, renderValue, data, multiple, onChange, entityId, entityIds } = props.data;
    const { t } = props.methods;
    const { mode } = pickerDef;
    const [visibile, setVisible] = useState(false);

    if ((!data && mode !== 'list') || !renderValue) {
        return <div> loading... </div>
    }
    else {
        switch (mode) {
            case 'select': {
                return (
                    <Select
                        value={entityId}
                        onChange={onChange}
                        style={{ width: '50%' }}
                        options={data!.map(
                            ele => ({
                                value: ele.id,
                                label: ele.title,
                            })
                        )}
                        allowClear
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
                const { entity, projection, title, titleLabel, filter, sorter } = pickerDef;
                const p = typeof projection === 'function' ? projection() : projection;
                const f = typeof filter === 'function' ? filter() : filter;
                const s = typeof sorter === 'function' ? sorter() : sorter;
                return (
                    <Space>
                        <div>{renderValue}</div>
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<EditOutlined />}
                            onClick={() => setVisible(true)}
                        />
                        <Modal
                            title={`选择${t(`${pickerDef.entity}:name`)}`}
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