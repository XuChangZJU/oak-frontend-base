import React from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import './index.less';
export default function Render(props) {
    const { style, className, showHeader = true, showBack = false, onBack, backIcon, delta, title, subTitle, extra, tags, children, content,
    // contentStyle,
    // contentClassName,
    // bodyStyle,
    // bodyClassName,
     } = props.data;
    const { t, goBack } = props.methods;
    const prefixCls = 'oak-new';
    return (<div style={style} className={classNames(`${prefixCls}-pageHeader`, className)}>
            {showHeader && (title || showBack || subTitle || tags || extra) && (<div className={`${prefixCls}-pageHeader-header`}>
                    <div className={`${prefixCls}-pageHeader-header-left`}>
                        {showBack && (<Button type="text" className={`${prefixCls}-pageHeader-header-back`} onClick={() => {
                    if (typeof onBack === 'function') {
                        onBack();
                        return;
                    }
                    goBack(delta);
                }}>
                                {backIcon || (<ArrowLeftOutlined className={`${prefixCls}-pageHeader-header-backIcon`}/>)}
                            </Button>)}
                        {title && (<span className={`${prefixCls}-pageHeader-header-title`}>
                                {title}
                            </span>)}
                        {subTitle && (<span className={`${prefixCls}-pageHeader-header-subTitle`}>
                                {subTitle}
                            </span>)}
                        {tags}
                    </div>
                    <div className={`${prefixCls}-pageHeader-header-extra`}>
                        {extra}
                    </div>
                </div>)}

            {content ? (<div 
        // style={contentStyle}
        className={classNames(`${prefixCls}-pageHeader-content`
            // contentClassName
            )}>
                    {content}
                </div>) : null}

            <div 
    // style={bodyStyle}
    className={classNames(`${prefixCls}-pageHeader-body`
        // bodyClassName
        )}>
                {children}
            </div>
        </div>);
}
