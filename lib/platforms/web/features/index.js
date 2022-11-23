"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFeatures = exports.FeaturesProvider = void 0;
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importStar(require("react"));
var FeaturesContext = react_1.default.createContext({
    features: {},
});
var FeaturesProvider = function (_a) {
    var features = _a.features, children = _a.children;
    return (0, react_1.createElement)(FeaturesContext.Provider, {
        value: { features: features },
    }, children);
};
exports.FeaturesProvider = FeaturesProvider;
var useFeatures = function () {
    var features = (0, react_1.useContext)(FeaturesContext).features;
    return features;
};
exports.useFeatures = useFeatures;
