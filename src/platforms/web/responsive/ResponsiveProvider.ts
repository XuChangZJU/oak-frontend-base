import { createElement, useMemo } from 'react';
import { ResponsiveContext, Breakpoints } from './context';

export interface ResponsiveProviderProps {
    children?: React.ReactNode;
    breakpoints?: Breakpoints;
}

export function ResponsiveProvider(props: ResponsiveProviderProps) {
    const { breakpoints, children } = props;
    const value = useMemo(
        () => ({
            breakpoints,
        }),
        [breakpoints]
    );
    return createElement(
        ResponsiveContext.Provider,
        {
            value,
        },
        children
    );
}
