import { useContext, useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';

import {
    ResponsiveContext,
    defaultBreakpoints,
    Breakpoints,
    Values,
    Width
} from './context';

export function useWidth(props?: { breakpoints?: Breakpoints }) {
    const { breakpoints: breakpointsFromContext } =
        useContext(ResponsiveContext) || {};

    const { breakpoints: breakpointsFromProps } = props || {};

    const breakpoints = Object.assign(
        defaultBreakpoints,
        breakpointsFromProps,
        breakpointsFromContext
    ) as Breakpoints;

    let width: Width = 'xs';
    const obj = breakpoints.values as Values;

    const obj2 = {};
    Object.keys(obj)
        .sort((ele1, ele2) => obj[ele1] - obj[ele2])
        .forEach((key, index) => {
            const value = obj[key as keyof typeof breakpoints.values];
            const nextKey = Object.keys(obj)[index + 1];
            let result;
            if (index === 0) {
                if (value === 0) {
                    result = useMediaQuery({
                        minWidth: obj[key],
                        maxWidth: obj[nextKey] - 0.2,
                    });
                } else {
                    result = useMediaQuery({
                        maxWidth: obj[key] - 0.2,
                    });
                }
            } else if (index === Object.keys(obj).length - 1) {
                result = useMediaQuery({
                    minWidth: obj[key],
                });
            } else {
                result = useMediaQuery({
                    minWidth: obj[key],
                    maxWidth: obj[nextKey] - 0.2,
                });
            }

            Object.assign(obj2, {
                [key]: result,
            });
        });

    for (let w in obj2) {
        if (obj2[w as keyof typeof obj2]) {
            width = w;
            break;
        }
    }
    return width;
}
