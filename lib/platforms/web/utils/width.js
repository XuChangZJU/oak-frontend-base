"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrowserWidth = void 0;
const context_1 = require("../responsive/context");
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
function getBrowserWidth() {
    const width = window.innerWidth;
    const smWidth = context_1.values['sm'];
    const mdWidth = context_1.values['md'];
    const lgWidth = context_1.values['lg'];
    const xlWidth = context_1.values['xl'];
    const xxlWidth = context_1.values['xxl'];
    let size = 'xs';
    if (width >= xxlWidth) {
        size = 'xxl';
    }
    else if (width >= xlWidth) {
        size = 'xl';
    }
    else if (width >= lgWidth) {
        size = 'lg';
    }
    else if (width >= mdWidth) {
        size = 'md';
    }
    else if (width >= smWidth) {
        size = 'sm';
    }
    else {
        size = 'xs';
    }
    return size;
}
exports.getBrowserWidth = getBrowserWidth;
