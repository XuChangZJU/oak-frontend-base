"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponent = void 0;
const page_react_1 = require("./page.react");
const DEFAULT_REACH_BOTTOM_DISTANCE = 50;
function createComponent(option, features) {
    const BaseComponent = (0, page_react_1.createComponent)(option, features);
    class Component extends BaseComponent {
        handleResize() {
            // TODO native跑到了再实现
            // const size: WechatMiniprogram.Page.IResizeOption = {
            //     size: {
            //         windowHeight: window.innerHeight,
            //         windowWidth: window.innerWidth,
            //     },
            // };
            // const { resize } = this.oakOption.lifetimes || {};
            // resize && resize(size);
        }
        async componentDidMount() {
            await super.componentDidMount();
        }
        componentWillUnmount() {
            super.componentWillUnmount();
        }
        render() {
            const { oakPullDownRefreshLoading } = this.state;
            const Render = super.render();
            return Render;
        }
    }
    return Component;
}
exports.createComponent = createComponent;
