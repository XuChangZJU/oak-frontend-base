import React from 'react';
type OakComponentProperties = {
    path?: string;
    properties?: Record<string, any>;
};
declare const withRouter: (Component: React.ComponentType<any>, { path, properties }: OakComponentProperties) => React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export default withRouter;
