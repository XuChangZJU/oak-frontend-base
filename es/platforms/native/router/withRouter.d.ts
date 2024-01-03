import React from 'react';
declare const withRouter: (Component: React.ComponentType<any>, { path, properties }: {
    path?: string | undefined;
    properties?: Record<string, any> | undefined;
}) => (props: any) => React.JSX.Element;
export default withRouter;
