"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFeatures = exports.FeaturesProvider = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = tslib_1.__importStar(require("react"));
const FeaturesContext = react_1.default.createContext({
    features: {},
});
const FeaturesProvider = (props) => {
    const { features, children } = props;
    return ((0, jsx_runtime_1.jsx)(FeaturesContext.Provider, { value: { features }, children: children }));
};
exports.FeaturesProvider = FeaturesProvider;
const useFeatures = () => {
    const { features } = (0, react_1.useContext)(FeaturesContext);
    return features;
};
exports.useFeatures = useFeatures;
