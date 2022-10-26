import React from 'react';

export type Width = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type Keys = Width[];

export type Values = {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
};

export type Breakpoints = {
    keys: Keys;
    values: Values;
};

export const keys: Keys = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
export const values: Values = {
    xs: 576, //小于576
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600,
};

export const defaultBreakpoints: Breakpoints = {
    keys: keys,
    values: values,
};


export const ResponsiveContext = React.createContext<{ breakpoints?: Breakpoints }>({
    breakpoints: defaultBreakpoints,
});
