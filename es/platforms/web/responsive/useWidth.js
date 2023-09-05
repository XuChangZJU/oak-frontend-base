import { useContext } from 'react';
import { useMediaQuery } from 'react-responsive';
import { ResponsiveContext, defaultBreakpoints, } from './context';
export function useWidth(props) {
    const { breakpoints: breakpointsFromContext } = useContext(ResponsiveContext) || {};
    const { breakpoints: breakpointsFromProps } = props || {};
    const breakpoints = Object.assign(defaultBreakpoints, breakpointsFromProps, breakpointsFromContext);
    const responsiveValues = breakpoints.values;
    const smWidth = responsiveValues['sm'];
    const mdWidth = responsiveValues['md'];
    const lgWidth = responsiveValues['lg'];
    const xlWidth = responsiveValues['xl'];
    const xxlWidth = responsiveValues['xxl'];
    const xxlWidthResult = useMediaQuery({
        minWidth: xxlWidth,
    });
    const xlWidthResult = useMediaQuery({
        minWidth: xlWidth,
    });
    const lgWidthResult = useMediaQuery({
        minWidth: lgWidth,
    });
    const mdWidthResult = useMediaQuery({
        minWidth: mdWidth,
    });
    const smWidthResult = useMediaQuery({
        minWidth: smWidth,
    });
    if (xxlWidthResult) {
        return 'xxl';
    }
    else if (xlWidthResult) {
        return 'xl';
    }
    else if (lgWidthResult) {
        return 'lg';
    }
    else if (mdWidthResult) {
        return 'md';
    }
    else if (smWidthResult) {
        return 'sm';
    }
    return 'xs';
}
