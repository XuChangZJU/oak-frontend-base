import React from 'react';
import { Tag, Descriptions, Image, Space } from 'antd';
import { getLabel, getType, getValue } from '../../utils/usefulFn';
import { get } from 'oak-domain/lib/utils/lodash';
function RenderRow(props) {
    const { type, value, color } = props;
    if (type === 'image') {
        if (value instanceof Array) {
            return (<Space wrap>
                    {value.map((ele) => (<Image width={100} height={100} src={ele} style={{ objectFit: 'contain' }}/>))}
                </Space>);
        }
        else {
            return (<Space wrap>
                    <Image width={100} height={100} src={value} style={{ objectFit: 'contain' }}/>
                </Space>);
        }
    }
    if (type === 'enum') {
        <Tag color={color}>
            {value}
        </Tag>;
    }
    return value;
}
export default function Render(props) {
    const { methods, data: oakData } = props;
    const { t } = methods;
    const { entity, title, colorDict, bordered, column, renderData, layout = 'horizontal', judgeAttributes, data, } = oakData;
    return (<Descriptions title={title} column={column} bordered={bordered} layout={layout}>
            {judgeAttributes?.map((ele) => {
            let renderValue = getValue(data, ele.path, ele.entity, ele.attr, ele.attrType, t);
            let renderLabel = getLabel(ele.attribute, ele.entity, ele.attr, t);
            const renderType = getType(ele.attribute, ele.attrType);
            if ([null, '', undefined].includes(renderValue)) {
                renderValue = t('not_filled_in');
            }
            const stateValue = get(data, ele.path);
            const color = (colorDict &&
                colorDict[ele.entity]?.[ele.attr]?.[stateValue]) ||
                'default';
            return (<Descriptions.Item label={renderLabel} span={ele.attribute.span || 1}>
                        <RenderRow type={renderType} value={renderValue} color={color}/>
                    </Descriptions.Item>);
        })}
        </Descriptions>);
}
