"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponent = void 0;
const tslib_1 = require("tslib");
const react_native_1 = require("react-native");
const page_react_1 = require("./page.react");
const withRouter_1 = tslib_1.__importDefault(require("./platforms/native/router/withRouter"));
const DEFAULT_REACH_BOTTOM_DISTANCE = 50;
function createComponent(option, features) {
    const BaseComponent = (0, page_react_1.createComponent)(option, features);
    class Component extends BaseComponent {
        handleResize({ window, screen, }) {
            const size = {
                size: {
                    windowHeight: window.height,
                    windowWidth: window.width,
                },
            };
            const { resize } = this.oakOption.lifetimes || {};
            resize && resize(size);
        }
        registerResize() {
            this.dimensionsSubscription = react_native_1.Dimensions.addEventListener('change', this.handleResize);
        }
        unregisterResize() {
            this.dimensionsSubscription.remove();
        }
        async componentDidMount() {
            this.registerResize();
            await super.componentDidMount();
        }
        componentWillUnmount() {
            this.unregisterResize();
            super.componentWillUnmount();
        }
        render() {
            const { oakPullDownRefreshLoading } = this.state;
            const Render = super.render();
            return Render;
        }
    }
    return (0, withRouter_1.default)(Component, option);
}
exports.createComponent = createComponent;
