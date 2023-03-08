"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var features_1 = require("../platforms/web/features");
// react 独有
function useFeatures() {
    return (0, features_1.useFeatures)();
}
exports.default = useFeatures;
;
