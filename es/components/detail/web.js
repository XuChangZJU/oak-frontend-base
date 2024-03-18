import React from 'react';
import { Space, Image } from 'antd-mobile';
import styles from './mobile.module.less';
import { getLabel, getType, getValue } from '../../utils/usefulFn';
function RenderRow(props) {
    const { type, label, value } = props;
    if (type === 'image') {
        if (value instanceof Array) {
            return (<div className={styles.renderRow}>
                    <div className={styles.renderLabel}>
                        {label}
                    </div>
                    <Space wrap>
                        {value.map((ele) => (<Image width={70} height={70} src={ele} fit="contain"/>))}
                    </Space>
                </div>);
        }
        else {
            return (<div className={styles.renderRow}>
                    <div className={styles.renderLabel}>
                        {label}
                    </div>
                    <Space wrap>
                        <Image width={70} height={70} src={value} fit="contain"/>
                    </Space>
                </div>);
        }
    }
    return (<div className={styles.renderRow}>
            <div className={styles.renderLabel}>
                {label}
            </div>
            <div className={styles.renderValue}>{value ? String(value) : '--'}</div>
        </div>);
}
export default function Render(props) {
    const { methods, data: oakData } = props;
    const { t } = methods;
    const { title, renderData, entity, judgeAttributes, data } = oakData;
    return (<div className={styles.panel}>
            {title && <div className={styles.title}>{title}</div>}
            <div className={styles.panel_content}>
                <Space direction="vertical" style={{ '--gap': '10px' }}>
                    {judgeAttributes &&
            judgeAttributes.map((ele) => {
                let renderValue = getValue(data, ele.path, ele.entity, ele.attr, ele.attrType, t);
                let renderLabel = getLabel(ele.attribute, ele.entity, ele.attr, t);
                const renderType = getType(ele.attribute, ele.attrType);
                if ([null, '', undefined].includes(renderValue)) {
                    renderValue = t('not_filled_in');
                }
                return (<RenderRow label={renderLabel} value={renderValue} type={renderType}/>);
            })}
                </Space>
            </div>
        </div>);
}
