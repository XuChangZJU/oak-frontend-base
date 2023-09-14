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
export declare const keys: Keys;
export declare const values: Values;
export declare const defaultBreakpoints: Breakpoints;
export declare const ResponsiveContext: React.Context<{
    breakpoints?: Breakpoints | undefined;
}>;
