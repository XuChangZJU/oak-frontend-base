"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFeatures = exports.FeaturesProvider = void 0;
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importStar(require("react"));
const FeaturesContext = react_1.default.createContext({
    features: {},
});
const FeaturesProvider = ({ features, children }) => {
    return (0, react_1.createElement)(FeaturesContext.Provider, {
        value: { features },
    }, children);
};
exports.FeaturesProvider = FeaturesProvider;
const useFeatures = () => {
    const { features } = (0, react_1.useContext)(FeaturesContext);
    return features;
};
exports.useFeatures = useFeatures;
