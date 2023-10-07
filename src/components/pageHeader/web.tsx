import React, { memo } from 'react';
import { Row, Col, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { WebComponentProps } from '../../types/Page';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';

import './index.less';

type PageHeaderProps = {
    style?: React.CSSProperties;
    className?: string;
    title?: React.ReactNode;
    showBack?: boolean;
    onBack?: () => void;
    backIcon?: React.ReactNode;
    delta?: number; //有返回按钮时，返回第几层
    extra?: React.ReactNode;
    subTitle?: React.ReactNode;
    contentMargin?: boolean; // 设置内容是否有边距 默认true 边距为20px
    contentStyle?: React.CSSProperties;
    contentClassName?: string;
    tags?: React.ReactNode;
    children?: React.ReactNode;
    showHeader?: boolean; //默认true 显示头部
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
    const {
        style,
        className,
        children,
        title,
        subTitle,
        extra,
        showBack = false,
        onBack,
        backIcon,
        delta,
        contentMargin = true,
        contentStyle,
        contentClassName,
        tags,
        showHeader = true,
    } = props.data;
    const { t, goBack } = props.methods;
    const prefixCls = 'oak';

    return (
        <div
            style={style}
            className={classNames(`${prefixCls}-pageHeader`, className)}
        >
            {showHeader && (title || showBack || subTitle || tags || extra) && (
                <div className={`${prefixCls}-pageHeader-header`}>
                    <Row justify="center">
                        <Col
                            flex="auto"
                            className={`${prefixCls}-pageHeader-header-col`}
                        >
                            {showBack && (
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
                        </Col>
                        <Col flex="auto">{extra}</Col>
                    </Row>
                </div>
            )}

            <div
                style={contentStyle}
                className={classNames(
                    `${prefixCls}-pageHeader-content`,
                    contentClassName,
                    {
                        [`${prefixCls}-pageHeader-content-margin`]:
                            contentMargin,
                    }
                )}
            >
                {children}
            </div>
        </div>
    );
}
