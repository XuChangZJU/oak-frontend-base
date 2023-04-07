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
import { combineFilters } from 'oak-domain/lib/store/filter';


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
        onChange: (value: string[]) => void;
    }
>) {
    const { pickerRender, renderValue, data, multiple, onChange, entityId, entityIds } = props.data;
    const { t } = props.methods;
    const { mode } = pickerRender;
    const [visibile, setVisible] = useState(false);
    const [dynamicFilter, setDynamicFilter] = useState<ED[keyof ED]['Selection']['filter']>(undefined);
    const [dynamicSorter, setDynamicSorter] = useState<ED[keyof ED]['Selection']['sorter']>(undefined);
    const [dynamicProjection, setDynamicProjection] = useState<ED[keyof ED]['Selection']['data'] | undefined>(undefined);

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
                            onChange(value);
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
                            onChange={(value) => onChange(value as string[])}
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
                        onChange={(value) => onChange([value as string])}
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
                const { entity, projection, title, titleLabel, filter, sorter, required, getDynamicSelectors } = pickerRender;
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
                                        setDynamicFilter(combineFilters([dynamicFilter2, filter]));
                                    }
                                    if (dynamicSorter2 || sorter) {
                                        setDynamicSorter(dynamicSorter2 || sorter);
                                    }
                                    if (dynamicProjection2) {
                                        setDynamicProjection(dynamicProjection2);
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
                                oakFilters={dynamicFilter ? [{
                                    filter: dynamicFilter,
                                }]: undefined}
                                oakSorters={dynamicSorter ? dynamicSorter.map(ele => ({
                                    sorter: ele,
                                })): undefined}
                                oakProjection={dynamicProjection || projection}
                                onSelect={(data: [{ id: string}]) => {
                                    onChange(data.map(ele => ele.id));
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