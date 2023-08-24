import { Space, Tooltip, ButtonProps} from 'antd';
import React, { useContext,  } from 'react';
import Style from './index.module.less';
import {
 ReloadOutlined
} from '@ant-design/icons';
import ButtonGroup from '../buttonGroup';
import ColumnSetting from '../columnSetting';
import { TableContext } from '../../listPro';
import { useFeatures } from '../../../platforms/web';
import { Locales } from '../../../features/locales';


type buttonProps = {
    label: string;
    type?: ButtonProps['type']
    onClick: () => void;
} 

type ToolBarProps = {
    title?: string;
    buttonGroup?: buttonProps[];
    reload: () => void;
}

function ToolBar(props: ToolBarProps) {
    const { title, buttonGroup, reload } = props;
    const features = useFeatures<{ locales: Locales<any, any, any, any> }>();
    const { tableAttributes, setTableAttributes } = useContext(TableContext);
    return (
        <div className={Style.toolbarContainer}>
            <div className={Style.title}>
                {title}
            </div>
            <div className={Style.toolbarRight}>
                <Space>
                    {buttonGroup && buttonGroup.length > 0 && (
                        <ButtonGroup items={buttonGroup} />
                    )}
                    <Tooltip title={features.locales.t('reload')}>
                        <div className={Style.reloadIconBox} onClick={() => {
                            reload()
                        }}>
                            <ReloadOutlined />
                        </div>
                    </Tooltip>
                    <ColumnSetting />
                </Space>
            </div>
        </div>
    )
}

export default ToolBar;