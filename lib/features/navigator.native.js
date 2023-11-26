"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navigator = void 0;
const Feature_1 = require("../types/Feature");
class Navigator extends Feature_1.Feature {
    namespace = '';
    setNamespace(namespace) {
        this.namespace = namespace;
        this.publish();
    }
    getLocation() {
        throw new Error('unimplemented');
    }
    getNamespace() {
        throw new Error('unimplemented');
    }
    async navigateTo(options, state, disableNamespace) {
        throw new Error('unimplemented');
    }
    async redirectTo(options, state, disableNamespace) {
        throw new Error('unimplemented');
    }
    async switchTab(options, state, disableNamespace) {
        throw new Error('unimplemented');
    }
    async navigateBack(delta) {
        throw new Error('unimplemented');
    }
    navigateBackOrRedirectTo(options, state, disableNamespace) {
        throw new Error('unimplemented');
    }
}
exports.Navigator = Navigator;
