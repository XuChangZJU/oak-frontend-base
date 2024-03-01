import React from 'react';

import { Button } from 'antd';
import { WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
import { ECode } from '../../types/ErrorPage';

import { ReactComponent as Light403Icon } from './assets/svg/assets-result-403.svg';
import { ReactComponent as Light404Icon } from './assets/svg/assets-result-404.svg';
import { ReactComponent as Light500Icon } from './assets/svg/assets-result-500.svg';
import { ReactComponent as LightMaintenanceIcon } from './assets/svg/assets-result-maintenance.svg';
import { ReactComponent as LightBrowserIncompatibleIcon } from './assets/svg/assets-result-browser-incompatible.svg';
import { ReactComponent as LightNetworkErrorIcon } from './assets/svg/assets-result-network-error.svg';
import './web.less';

interface IErrorPageProps {
    code: ECode;
    title?: string;
    desc?: string;
    children?: React.ReactNode;
    icon?: React.ReactNode;
}

const errorInfo = {
    [ECode.forbidden]: {
        title: '403 Forbidden',
        desc: '抱歉，您无权限访问此页面。',
        icon: <Light403Icon />,
    },
    [ECode.notFound]: {
        title: '404 Not Found',
        desc: '抱歉，您访问的页面不存在。',
        icon: <Light404Icon />,
    },
    [ECode.error]: {
        title: '500 Internal Server Error',
        desc: '抱歉，服务器出错啦！',
        icon: <Light500Icon />,
    },
    [ECode.networkError]: {
        title: '网络异常',
        desc: '网络异常，请稍后再试。',
        icon: <LightNetworkErrorIcon />,
    },
    [ECode.browserIncompatible]: {
        title: '浏览器版本低',
        desc: '抱歉，您正在使用的浏览器版本过低，无法打开当前网页。',
        icon: <LightBrowserIncompatibleIcon />,
    },
    [ECode.maintenance]: {
        title: '系统维护中',
        desc: '系统维护中，请稍后再试。',
        icon: <LightMaintenanceIcon />,
    },
};

export default function Render(
    props: WebComponentProps<
        ED,
        keyof ED,
        false,
        IErrorPageProps,
        {
            goBack: (delta?: number) => void;
        }
    >
) {
    const { code, icon, title, desc, children } = props.data;
    const { t, goBack } = props.methods;
    const info = errorInfo[code];
    const prefixCls = 'oak';

    return (
        <div className={`${prefixCls}-errorPage`}>
            {icon || info?.icon}
            <div className={`${prefixCls}-errorPage__title`}>
                {title || info?.title}
            </div>
            <div className={`${prefixCls}-errorPage__description`}>
                {desc || info?.desc}
            </div>
            {children || (
                <Button
                    type="primary"
                    onClick={() => {
                        goBack();
                    }}
                >
                    {t('back')}
                </Button>
            )}
        </div>
    );
}
