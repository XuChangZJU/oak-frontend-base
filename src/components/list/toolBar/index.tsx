import { Space, Tooltip, ButtonProps} from 'antd';
import React, { useContext,  } from 'react';
import Style from './index.module.less';
import { useTranslation } from 'react-i18next';
import {
 ReloadOutlined
} from '@ant-design/icons';
import ButtonGroup from '../buttonGroup';
import ColumnSetting from '../columnSetting';
import { TableContext } from '../../listPro';


type buttonProps = {
    label: string;
    type?: ButtonProps['type']
    onClick: () => void;
} 

type ToolBarProps = {
    title: string;
    buttonGroup?: buttonProps[];
    reload: () => void;
}

function ToolBar(props: ToolBarProps) {
    const { title, buttonGroup, reload } = props;
    const { t } = useTranslation();
    const { tableAttributes, setTableAttributes } = useContext(TableContext);
    return (
        <div className={Style.toolbarContainer}>
            <div className={Style.title}>
                {title}
            </div>
            <div className={Style.toolbarRight}>
                <Space>
                    {buttonGroup && buttonGroup.length && (
                        <ButtonGroup items={buttonGroup} />
                    )}
                    <Tooltip title={t('reload')}>
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