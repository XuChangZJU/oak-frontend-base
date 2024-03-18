import React, { memo } from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { WebComponentProps } from '../../types/Page';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';

import './index.less';

type PageHeaderProps = {
    style?: React.CSSProperties;
    className?: string;
    showHeader?: boolean; //默认true 显示头部
    showBack?: boolean;
    onBack?: () => void;
    backIcon?: React.ReactNode;
    delta?: number; //有返回按钮时，返回第几层
    title?: React.ReactNode;
    subTitle?: React.ReactNode;
    tags?: React.ReactNode;
    extra?: React.ReactNode;
    children?: React.ReactNode;
    content?: React.ReactNode;

    // contentStyle?: React.CSSProperties;
    // contentClassName?: string;
    bodyStyle?: React.ReactNode;
    bodyClassName?: string;

    allowBack: boolean;
};

type ED = EntityDict & BaseEntityDict;

export default function Render(
    props: WebComponentProps<
        ED,
        keyof ED,
        false,
        PageHeaderProps,
        {
            goBack: (delta?: number) => void;
        }
    >
) {
    const { data, methods } = props;
    const {
        style,
        className,
        showHeader = true,
        showBack = false,
        onBack,
        backIcon,
        delta,
        title,
        subTitle,
        extra,
        tags,
        children,
        content,

        // contentStyle,
        // contentClassName,
        bodyStyle,
        bodyClassName,
        allowBack = true, //state取
    } = data;
    const { t, goBack } = methods;
    const prefixCls = 'oak-new';
    const back = data.hasOwnProperty('showBack')
        ? showBack
        : allowBack;

    return (
        <div
            style={style}
            className={classNames(`${prefixCls}-pageHeader`, className)}
        >
            {showHeader && (title || back || subTitle || tags || extra) && (
                <div className={`${prefixCls}-pageHeader-header`}>
                    <div className={`${prefixCls}-pageHeader-header-left`}>
                        {back && (
                            <Button
                                type="text"
                                className={`${prefixCls}-pageHeader-header-back`}
                                onClick={() => {
                                    if (typeof onBack === 'function') {
                                        onBack();
                                        return;
                                    }
                                    goBack(delta);
                                }}
                            >
                                {backIcon || (
                                    <ArrowLeftOutlined
                                        className={`${prefixCls}-pageHeader-header-backIcon`}
                                    />
                                )}
                            </Button>
                        )}
                        {title && (
                            <span
                                className={`${prefixCls}-pageHeader-header-title`}
                            >
                                {title}
                            </span>
                        )}
                        {subTitle && (
                            <span
                                className={`${prefixCls}-pageHeader-header-subTitle`}
                            >
                                {subTitle}
                            </span>
                        )}
                        {tags}
                    </div>
                    <div className={`${prefixCls}-pageHeader-header-extra`}>
                        {extra}
                    </div>
                </div>
            )}

            {content ? (
                <div
                    // style={contentStyle}
                    className={classNames(
                        `${prefixCls}-pageHeader-content`
                        // contentClassName
                    )}
                >
                    {content}
                </div>
            ) : null}

            <div
                style={bodyStyle}
                className={classNames(
                    `${prefixCls}-pageHeader-body`, bodyClassName
                )}
            >
                {children}
            </div>
        </div >
    );
}
