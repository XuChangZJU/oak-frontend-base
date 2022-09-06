import { useContext } from 'react';
import { useMediaQuery } from 'react-responsive';

import {
    ResponsiveContext,
    defaultBreakpoints,
    Breakpoints,
    Values,
    Width,
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
    let isFirstZero = false;
    Object.keys(obj)
        .sort(
            (ele1, ele2) =>
                obj[ele1 as keyof typeof obj] - obj[ele2 as keyof typeof obj]
        )
        .forEach((key, index) => {
            const value = obj[key as keyof typeof breakpoints.values];
            const nextKey = Object.keys(obj)[index + 1];
            const preKey = Object.keys(obj)[index - 1];
            let result;
            if (index === 0) {
                if (value === 0) {
                    result = useMediaQuery({
                        minWidth: obj[key as keyof typeof obj],
                        maxWidth: obj[nextKey as keyof typeof obj] - 0.1,
                    });
                    isFirstZero = true;
                } else {
                    result = useMediaQuery({
                        maxWidth: obj[key as keyof typeof obj] - 0.1,
                    });
                }
            } else if (index === Object.keys(obj).length - 1) {
                if (isFirstZero) {
                    result = useMediaQuery({
                        minWidth: obj[key as keyof typeof obj],
                    });
                } else {
                    result = useMediaQuery({
                        minWidth: obj[preKey as keyof typeof obj],
                    });
                }
            } else {
                if (isFirstZero) {
                    result = useMediaQuery({
                        minWidth: obj[key as keyof typeof obj],
                        maxWidth: obj[nextKey as keyof typeof obj] - 0.1,
                    });
                } else {
                    result = useMediaQuery({
                        minWidth: obj[preKey as keyof typeof obj],
                        maxWidth: obj[key as keyof typeof obj] - 0.1,
                    });
                }
            }

            Object.assign(obj2, {
                [key]: result,
            });
        });

    for (let w in obj2) {
        if (obj2[w as keyof typeof obj2]) {
            width = w as Width;
            break;
        }
    }
    return width;
}
