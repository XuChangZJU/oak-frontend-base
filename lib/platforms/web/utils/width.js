"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrowserWidth = void 0;
var context_1 = require("../responsive/context");
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
    var width = window.innerWidth;
    var smWidth = context_1.values['sm'];
    var mdWidth = context_1.values['md'];
    var lgWidth = context_1.values['lg'];
    var xlWidth = context_1.values['xl'];
    var xxlWidth = context_1.values['xxl'];
    var size = 'xs';
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
