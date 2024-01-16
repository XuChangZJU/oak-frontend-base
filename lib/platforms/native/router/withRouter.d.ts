import React from 'react';
type OakComponentProperties = {
    path?: string;
    properties?: Record<string, any>;
};
declare const withRouter: (Component: React.ComponentType<any>, { path, properties }: OakComponentProperties) => (props: any) => import("react/jsx-runtime").JSX.Element;
export default withRouter;
