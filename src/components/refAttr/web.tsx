import React, { useState } from 'react';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import {
    Checkbox,
    Input,
    Radio,
    Popup,
    Button,
    DatePicker,
    Space,
    Cascader,
    Selector,
    Tag,
    Switch,
} from 'antd-mobile';
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
                    <Selector
                        value={[entityId]}
                        onChange={(value) => {
                            if (multiple) {
                                onChange(value);
                            }
                            else {
                                onChange(value[0]);
                            }
                        }}
                        options={data!.map(
                            ele => ({
                                value: ele.id,
                                label: ele.title,
                            })
                        )}
                        multiple={multiple}
                    ></Selector>
                );
            }
            case 'radio': {
                if (multiple) {
                    return (
                        <Checkbox.Group
                            value={entityIds}
                            onChange={onChange}
                        >
                            {
                                data!.map(
                                    ele => (
                                        <Checkbox value={ele.id}>{ele.title}</Checkbox>
                                    )
                                )
                            }
                        </Checkbox.Group>
                    );
                }
                return (
                    <Radio.Group
                        onChange={(value) => onChange(value)}
                        value={entityId}
                    >
                        {
                            data!.map(
                                ele => <Radio value={ele.id}>{ele.title}</Radio>
                            )
                        }
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
                            clearable={!required}
                            onClick={() => setVisible(true)}
                            onChange={(value) => {
                                if (!value) {
                                    onChange(undefined);
                                }
                            }}                            
                        />
                        <Popup
                            visible={visibile}
                            closeOnMaskClick={true}
                            onClose={() => setVisible(false)}
                            destroyOnClose={true}
                            showCloseButton={true}
                            bodyStyle={{
                                height: '80%',
                            }}
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
                        </Popup>
                    </Space>
                );
            }
        }
    }
}