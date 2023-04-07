/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
/// <reference types="wechat-miniprogram" />
import React from 'react';
declare const withRouter: (Component: React.ComponentType<any>, { path, properties }: {
    path?: string | undefined;
    properties?: Record<string, FunctionConstructor | WechatMiniprogram.Component.AllProperty> | undefined;
}) => React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export default withRouter;
