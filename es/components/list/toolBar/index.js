import React from 'react';
import { Space, Tooltip } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import ButtonGroup from '../buttonGroup';
import ColumnSetting from '../columnSetting';
import { useFeatures } from '../../../platforms/web';
import Style from './index.module.less';
function ToolBar(props) {
    const { title, buttonGroup, reload } = props;
    const features = useFeatures();
    return (<div className={Style.toolbarContainer}>
            <div className={Style.title}>{title}</div>
            <div className={Style.toolbarRight}>
                <Space>
                    {buttonGroup && buttonGroup.length > 0 && (<ButtonGroup items={buttonGroup}/>)}
                    <Tooltip title={features.locales.t('reload')}>
                        <div className={Style.reloadIconBox} onClick={() => {
            reload();
        }}>
                            <ReloadOutlined />
                        </div>
                    </Tooltip>
                    <ColumnSetting />
                </Space>
            </div>
        </div>);
}
export default ToolBar;
