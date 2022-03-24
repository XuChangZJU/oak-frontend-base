"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Feature = void 0;
class Feature {
    aspectProxy;
    context;
    getAspectProxy() {
        return this.aspectProxy;
    }
    setAspectProxy(aspectProxy) {
        this.aspectProxy = aspectProxy;
    }
    getContext() {
        return this.context;
    }
    setFrontContext(context) {
        this.context = context;
    }
}
exports.Feature = Feature;
