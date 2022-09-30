import { values as responsiveValues, Width } from '../responsive/context';

// const canUseDocument = !!(
//     typeof window !== 'undefined' &&
//     window.document &&
//     window.document.createElement
// );

// function getCssVarsValue(name: string, element: Element) {
//     if (!canUseDocument) return;
//     var el = element || document.documentElement;
//     return getComputedStyle(el).getPropertyValue(name);
// };

export function getBrowserWidth(): Width {
    const width = window.innerWidth;
    const smWidth = responsiveValues['sm'];
    const mdWidth = responsiveValues['md'];
    const lgWidth = responsiveValues['lg'];
    const xlWidth = responsiveValues['xl'];
    const xxlWidth = responsiveValues['xxl'];
    let size = 'xs';

    if (width >= xxlWidth) {
        size = 'xxl';
    } else if (width >= xlWidth) {
        size = 'xl';
    } else if (width >= lgWidth) {
        size = 'lg';
    } else if (width >= mdWidth) {
        size = 'md';
    } else if (width >= smWidth) {
        size = 'sm';
    } else {
        size = 'xs';
    }

    return size as Width;
}
