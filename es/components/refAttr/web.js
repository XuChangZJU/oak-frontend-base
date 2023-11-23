import React, { useState } from 'react';
import { Checkbox, Input, Radio, Popup, Space, Selector, } from 'antd-mobile';
import Picker from '../picker';
import { combineFilters } from 'oak-domain/lib/store/filter';
export default function render(props) {
    const { pickerRender, renderValue, data, multiple, onChange, entityId, entityIds, schema, } = props.data;
    const { t } = props.methods;
    const { mode } = pickerRender;
    const [visibile, setVisible] = useState(false);
    const [dynamicFilter, setDynamicFilter] = useState(undefined);
    const [dynamicSorter, setDynamicSorter] = useState(undefined);
    const [dynamicProjection, setDynamicProjection] = useState(undefined);
    if (!data && mode !== 'list') {
        return <div> loading... </div>;
    }
    else {
        switch (mode) {
            case 'select': {
                return (<Selector value={[entityId]} onChange={(value) => {
                        onChange(value);
                    }} options={data.map((ele) => ({
                        value: ele.id,
                        label: ele.title,
                    }))} multiple={multiple}></Selector>);
            }
            case 'radio': {
                if (multiple) {
                    return (<Checkbox.Group value={entityIds} onChange={(value) => onChange(value)}>
                            {data.map((ele) => (<Checkbox value={ele.id}>{ele.title}</Checkbox>))}
                        </Checkbox.Group>);
                }
                return (<Radio.Group onChange={(value) => onChange([value])} value={entityId}>
                        {data.map((ele) => (<Radio value={ele.id}>{ele.title}</Radio>))}
                    </Radio.Group>);
            }
            case 'list': {
                const { entity, projection, title, titleLabel, filter, sorter, required, getDynamicSelectors, } = pickerRender;
                return (<Space>
                        <Input value={renderValue} clearable={!required} onClick={async () => {
                        if (getDynamicSelectors) {
                            // todo 这段代码没测过
                            const { projection: dynamicProjection2, filter: dynamicFilter2, sorter: dynamicSorter2, } = await getDynamicSelectors();
                            if (dynamicFilter2 || filter) {
                                setDynamicFilter(combineFilters(entity, schema, [
                                    dynamicFilter2,
                                    filter,
                                ]));
                            }
                            if (dynamicSorter2 || sorter) {
                                setDynamicSorter(dynamicSorter2 || sorter);
                            }
                            if (dynamicProjection2 || projection) {
                                setDynamicProjection(dynamicProjection2 || projection);
                            }
                        }
                        else {
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
                    }} onChange={(value) => {
                        if (!value) {
                            onChange([]);
                        }
                    }}/>
                        <Popup visible={visibile} closeOnMaskClick={true} onClose={() => {
                        setDynamicFilter(undefined);
                        setDynamicProjection(undefined);
                        setDynamicSorter(undefined);
                        setVisible(false);
                    }} destroyOnClose={true} showCloseButton={true} bodyStyle={{
                        height: '80%',
                    }}>
                            <Picker multiple={false} oakPath={`$refAttr-picker-${entity}`} entity={entity} title={title} titleLabel={titleLabel} filter={dynamicFilter} sorter={dynamicSorter} projection={dynamicProjection} onSelect={(data) => {
                        onChange(data.map((ele) => ele.id));
                        setVisible(false);
                    }}/>
                        </Popup>
                    </Space>);
            }
        }
    }
}
