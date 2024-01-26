import React, { useState } from 'react';
import styles from './index.module.less';
import { Space, Checkbox, Divider, Image } from 'antd';
import { EyeOutlined, } from '@ant-design/icons';
function MaskView(props) {
    const { selected, onClick, setVisibleTrue } = props;
    return (<div className={selected ? styles['mask-checked'] : styles.mask} onClick={onClick}>
            <div className={styles.row2}>
                <Checkbox checked={selected}/>
                <Space size={0} split={<Divider type="vertical"/>}>
                    <EyeOutlined style={{
            color: 'white',
            fontSize: '1.4em',
        }} onClick={(e) => {
            setVisibleTrue();
            e.stopPropagation();
        }}/>
                </Space>
            </div>
        </div>);
}
function ImgBox(props) {
    const { width, height, bordered = false, type = 'contain', src, alt, mode, selected, onClick } = props;
    const [visible, setVisible] = useState(false);
    if (bordered) {
        return (<div className={styles.imgBoxBorder}>
                {mode === 'select' && (<MaskView selected={selected} onClick={() => onClick && onClick()} setVisibleTrue={() => {
                    setVisible(true);
                }}/>)}
                <img width={width || 72} height={height || 72} src={src} style={{
                objectFit: type,
                borderRadius: 8,
            }} alt={'img' || alt}/>
                <Image style={{ display: 'none' }} src={src} preview={{
                visible,
                src,
                onVisibleChange: (value) => {
                    setVisible(value);
                },
            }}/>
            </div>);
    }
    return (<div className={styles.imgBox}>
            {mode === 'select' && (<MaskView selected={selected} onClick={() => onClick && onClick()} setVisibleTrue={() => {
                setVisible(true);
            }}/>)}
            <img width={width || 72} height={height || 72} src={src} style={{
            objectFit: type,
        }} alt={'img' || alt}/>
            <Image style={{ display: 'none' }} src={src} preview={{
            visible,
            src,
            onVisibleChange: (value) => {
                setVisible(value);
            },
        }}/>
        </div>);
}
export default ImgBox;
