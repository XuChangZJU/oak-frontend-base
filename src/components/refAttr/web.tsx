import React, { useState } from 'react';

import {
    Checkbox,
    Input,
    Radio,
    Popup,
    Space,
    Selector,
} from 'antd-mobile';
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
            entityId: string;
            entityIds: string[];
            multiple: boolean;
            renderValue: string;
            data?: { id: string; title: string }[];
            pickerRender: OakAbsRefAttrPickerRender<ED, keyof ED>;
            onChange: (value: string[]) => void;
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
        entityId,
        entityIds,
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
                return (
                    <Selector
                        value={[entityId]}
                        onChange={(value) => {
                            onChange(value);
                        }}
                        options={data!.map((ele) => ({
                            value: ele.id,
                            label: ele.title,
                        }))}
                        multiple={multiple}
                    ></Selector>
                );
            }
            case 'radio': {
                if (multiple) {
                    return (
                        <Checkbox.Group
                            value={entityIds}
                            onChange={(value) => onChange(value as string[])}
                        >
                            {data!.map((ele) => (
                                <Checkbox value={ele.id}>{ele.title}</Checkbox>
                            ))}
                        </Checkbox.Group>
                    );
                }
                return (
                    <Radio.Group
                        onChange={(value) => onChange([value as string])}
                        value={entityId}
                    >
                        {data!.map((ele) => (
                            <Radio value={ele.id}>{ele.title}</Radio>
                        ))}
                    </Radio.Group>
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
                            clearable={!required}
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
                            onChange={(value) => {
                                if (!value) {
                                    onChange([]);
                                }
                            }}
                        />
                        <Popup
                            visible={visibile}
                            closeOnMaskClick={true}
                            onClose={() => {
                                setDynamicFilter(undefined);
                                setDynamicProjection(undefined);
                                setDynamicSorter(undefined);
                                setVisible(false);
                            }}
                            destroyOnClose={true}
                            showCloseButton={true}
                            bodyStyle={{
                                height: '80%',
                            }}
                        >
                            <Picker
                                multiple={false}
                                oakPath={`$refAttr-picker-${entity}`}
                                entity={entity as string}
                                title={title}
                                titleLabel={titleLabel}
                                filter={dynamicFilter}
                                sorter={dynamicSorter}
                                projection={dynamicProjection}
                                onSelect={(data: [{ id: string }]) => {
                                    onChange(data.map((ele) => ele.id));
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
