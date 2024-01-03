import React from 'react';
declare const withRouter: (Component: React.ComponentType<any>, { path, properties }: {
    path?: string | undefined;
    properties?: Record<string, any> | undefined;
}) => (props: any) => import("react/jsx-runtime").JSX.Element;
export default withRouter;
