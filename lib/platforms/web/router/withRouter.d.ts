import React from 'react';
declare const withRouter: (Component: React.ComponentType<any>, { path, properties }: {
    path?: string | undefined;
    properties?: Record<string, any> | undefined;
}) => React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export default withRouter;
