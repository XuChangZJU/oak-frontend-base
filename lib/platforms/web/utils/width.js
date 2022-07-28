"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrowserWidth = void 0;
var context_1 = require("../responsive/context");
function getBrowserWidth() {
    var width = 'xxl';
    for (var i in context_1.values) {
        if (window.innerWidth < context_1.values[i]) {
            width = i;
            break;
        }
    }
    return width;
}
exports.getBrowserWidth = getBrowserWidth;
;
