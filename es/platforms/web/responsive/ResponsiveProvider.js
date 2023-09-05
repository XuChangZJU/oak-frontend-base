import { createElement, useMemo } from 'react';
import { ResponsiveContext } from './context';
export function ResponsiveProvider(props) {
    const { breakpoints, children } = props;
    const value = useMemo(() => ({
        breakpoints,
    }), [breakpoints]);
    return createElement(ResponsiveContext.Provider, {
        value,
    }, children);
}
