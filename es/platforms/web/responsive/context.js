import React from 'react';
export const keys = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
export const values = {
    xs: 576,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600,
};
export const defaultBreakpoints = {
    keys: keys,
    values: values,
};
export const ResponsiveContext = React.createContext({
    breakpoints: defaultBreakpoints,
});
