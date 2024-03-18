import React, { useState } from 'react';

import {
    Checkbox,
    Input,
    Radio,
    Modal,
    Space,
    Select,
} from 'antd';
import { OakAbsRefAttrPickerRender, ED } from '../../types/AbstractComponent';
import { WebComponentProps } from '../../types/Page';
import Picker from '../picker';
import { combineFilters } from 'oak-domain/lib/store/filter';
import { StorageSchema } from 'oak-domain/lib/types';


export default function render(
    props: WebComponentProps<
        ED,
        keyof ED,
        false,
        {
            entityIds: string[];
            multiple: boolean;
            renderValue: string;
            data?: { id: string; title: string }[];
            pickerRender: OakAbsRefAttrPickerRender<ED, keyof ED>;
            onChange: (value: string[]) => void;
            placeholder: string;
            schema: StorageSchema<ED>;
        }
    >
) {
    const {
        pickerRender,
        renderValue,
        data,
        multiple,
        onChange,
        entityIds,
        placeholder,
        schema,
    } = props.data;
    const { t } = props.methods;
    const { mode } = pickerRender;
    const [visibile, setVisible] = useState(false);
    const [dynamicFilter, setDynamicFilter] =
        useState<ED[keyof ED]['Selection']['filter']>(undefined);
    const [dynamicSorter, setDynamicSorter] =
        useState<ED[keyof ED]['Selection']['sorter']>(undefined);
    const [dynamicProjection, setDynamicProjection] = useState<
        ED[keyof ED]['Selection']['data'] | undefined
    >(undefined);

    if (!data && mode !== 'list') {
        return <div> loading... </div>;
    } else {
        switch (mode) {
            case 'select': {
                const entityId = entityIds && entityIds[0];
                return (
                    <Select
                        placeholder={placeholder}
                        mode={multiple ? 'multiple' : undefined}
                        value={multiple ? entityIds : entityId}
                        onChange={(value) => {
                            if (typeof value === 'string') {
                                onChange([value]);
                            } else if (!value) {
                                onChange([]);
                            } else if (value instanceof Array) {
                                onChange(value);
                            }
                        }}
                        options={data!.map((ele) => ({
                            value: ele.id,
                            label: ele.title,
                        }))}
                        allowClear={!pickerRender.required}
                    ></Select>
                );
            }
            case 'radio': {
                const entityId = entityIds && entityIds[0];
                if (multiple) {
                    return (
                        <Checkbox.Group
                            options={data!.map((ele) => ({
                                value: ele.id,
                                label: ele.title,
                            }))}
                            value={entityIds}
                            onChange={(value) => onChange(value as string[])}
                        />
                    );
                }
                return (
                    <Radio.Group
                        onChange={({ target }) => onChange(target.value)}
                        value={entityId}
                        options={data!.map((ele) => ({
                            value: ele.id,
                            label: ele.title,
                        }))}
                    ></Radio.Group>
                );
            }
            case 'list': {
                const {
                    entity,
                    projection,
                    title,
                    titleLabel,
                    filter,
                    sorter,
                    required,
                    getDynamicSelectors,
                } = pickerRender;
                return (
                    <Space>
                        <Input
                            placeholder={placeholder}
                            value={renderValue}
                            allowClear={!required}
                            onClick={async () => {
                                if (getDynamicSelectors) {
                                    // todo 这段代码没测过
                                    const {
                                        projection: dynamicProjection2,
                                        filter: dynamicFilter2,
                                        sorter: dynamicSorter2,
                                    } = await getDynamicSelectors();
                                    if (dynamicFilter2 || filter) {
                                        setDynamicFilter(
                                            combineFilters(entity, schema, [
                                                dynamicFilter2,
                                                filter,
                                            ])
                                        );
                                    }
                                    if (dynamicSorter2 || sorter) {
                                        setDynamicSorter(
                                            dynamicSorter2 || sorter
                                        );
                                    }
                                    if (dynamicProjection2 || projection) {
                                        setDynamicProjection(
                                            dynamicProjection2 || projection
                                        );
                                    }
                                } else {
                                    if (filter) {
                                        setDynamicFilter(filter);
                                    }
                                    if (sorter) {
                                        setDynamicSorter(sorter);
                                    }
                                    if (projection) {
                                        setDynamicProjection(projection);
                                    }
                                }
                                setVisible(true);
                            }}
                            onChange={({ currentTarget }) => {
                                if (!currentTarget.value) {
                                    onChange([]);
                                }
                            }}
                        />
                        <Modal
                            title={`选择${t(`${pickerRender.entity}:name`)}`}
                            open={visibile}
                            closable={true}
                            onCancel={() => {
                                setDynamicFilter(undefined);
                                setDynamicProjection(undefined);
                                setDynamicSorter(undefined);
                                setVisible(false);
                            }}
                            destroyOnClose={true}
                            footer={null}
                        >
                            <Picker
                                multiple={false}
                                oakPath={`$refAttr-picker-${entity}`}
                                entity={entity as string}
                                title={title}
                                titleLabel={titleLabel}
                                filter={dynamicFilter}
                                sorter={dynamicSorter}
                                projection={dynamicProjection || projection}
                                onSelect={(data: { id: string }[]) => {
                                    onChange(data.map((ele) => ele.id));
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
