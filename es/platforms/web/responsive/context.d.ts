import React from 'react';
export declare type Width = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export declare type Keys = Width[];
export declare type Values = {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
};
export declare type Breakpoints = {
    keys: Keys;
    values: Values;
};
export declare const keys: Keys;
export declare const values: Values;
export declare const defaultBreakpoints: Breakpoints;
export declare const ResponsiveContext: React.Context<{
    breakpoints?: Breakpoints | undefined;
}>;
