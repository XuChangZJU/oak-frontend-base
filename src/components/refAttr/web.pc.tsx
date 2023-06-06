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
import { combineFilters } from 'oak-domain/lib/store/filter';

type ED = EntityDict & BaseEntityDict;

export default function render(
    props: WebComponentProps<
        ED,
        keyof EntityDict,
        false,
        {
            entityIds: string[];
            multiple: boolean;
            renderValue: string;
            data?: { id: string; title: string }[];
            pickerRender: OakAbsRefAttrPickerRender<ED, keyof ED>;
            onChange: (value: string[]) => void;
        }
    >
) {
    const { pickerRender, renderValue, data, multiple, onChange, entityIds } =
        props.data;
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
                        value={entityId}
                        onChange={(value) => onChange([value])}
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
                                            combineFilters([
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
                                        setDynamicFilter(
                                            combineFilters([filter])
                                        );
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
                                oakFilters={
                                    dynamicFilter
                                        ? [
                                              {
                                                  filter: dynamicFilter,
                                              },
                                          ]
                                        : undefined
                                }
                                oakSorters={
                                    dynamicSorter
                                        ? dynamicSorter.map((ele) => ({
                                              sorter: ele,
                                          }))
                                        : undefined
                                }
                                oakProjection={dynamicProjection || projection}
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
