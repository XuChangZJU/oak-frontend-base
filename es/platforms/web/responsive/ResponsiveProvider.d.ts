/// <reference types="react" />
import { Breakpoints } from './context';
export interface ResponsiveProviderProps {
    children?: React.ReactNode;
    breakpoints?: Breakpoints;
}
export declare function ResponsiveProvider(props: ResponsiveProviderProps): import("react").FunctionComponentElement<import("react").ProviderProps<{
    breakpoints?: Breakpoints | undefined;
}>>;
