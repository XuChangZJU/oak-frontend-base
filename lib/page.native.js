"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponent = void 0;
const page_react_1 = require("./page.react");
const DEFAULT_REACH_BOTTOM_DISTANCE = 50;
function createComponent(option, features) {
    const BaseComponent = (0, page_react_1.createComponent)(option, features);
    class Component extends BaseComponent {
        scrollEvent = () => {
            this.checkReachBottom();
        };
        registerPageScroll() {
            window.addEventListener('scroll', this.scrollEvent);
        }
        unregisterPageScroll() {
            window.removeEventListener('scroll', this.scrollEvent);
        }
        checkReachBottom() {
            if (!this.supportPullDownRefresh()) {
                return;
            }
            const isCurrentReachBottom = document.body.scrollHeight -
                (window.innerHeight + window.scrollY) <=
                DEFAULT_REACH_BOTTOM_DISTANCE;
            if (!this.isReachBottom && isCurrentReachBottom && option.isList) {
                this.isReachBottom = true;
                // 执行触底事件
                this.loadMore();
                return;
            }
            this.isReachBottom = isCurrentReachBottom;
        }
        async componentDidMount() {
            this.registerPageScroll();
            await super.componentDidMount();
        }
        componentWillUnmount() {
            this.unregisterPageScroll();
            super.componentWillUnmount();
        }
        render() {
            const { oakPullDownRefreshLoading } = this.state;
            const Render = super.render();
            return Render;
        }
    }
}
exports.createComponent = createComponent;
