"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFormData = exports.useFeature = exports.FeatureProvider = void 0;
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importStar(require("react"));
var Feature_1 = require("./../../../types/Feature");
var FeatureContext = react_1.default.createContext({
    features: {},
});
var FeatureProvider = function (_a) {
    var features = _a.features, children = _a.children;
    return (0, react_1.createElement)(FeatureContext.Provider, {
        value: { features: features },
    }, children);
};
exports.FeatureProvider = FeatureProvider;
var useFeature = function () {
    var features = (0, react_1.useContext)(FeatureContext).features;
    return {
        features: features,
    };
};
exports.useFeature = useFeature;
function useFormData(useHook) {
    var _this = this;
    var features = (0, react_1.useContext)(FeatureContext).features;
    var _a = tslib_1.__read((0, react_1.useState)({}), 2), state = _a[0], setState = _a[1];
    var sub;
    (0, react_1.useEffect)(function () {
        subscribe2();
        return function () {
            unsubscribe2();
        };
    }, []);
    var subscribe2 = function () {
        if (!sub) {
            sub = (0, Feature_1.subscribe)(function () { return reRender(); });
        }
    };
    var unsubscribe2 = function () {
        if (sub) {
            sub();
            sub = undefined;
        }
    };
    var reRender = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var data;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, useHook({ features: features })];
                case 1:
                    data = _a.sent();
                    setState(data);
                    return [2 /*return*/];
            }
        });
    }); };
    return state;
}
exports.useFormData = useFormData;
