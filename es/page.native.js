import { Dimensions } from 'react-native';
import { createComponent as createReactComponent } from './page.react';
import withRouter from './platforms/native/router/withRouter';
const DEFAULT_REACH_BOTTOM_DISTANCE = 50;
export function createComponent(option, features) {
    const BaseComponent = createReactComponent(option, features);
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
            this.dimensionsSubscription = Dimensions.addEventListener('change', this.handleResize.bind(this));
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
    return withRouter(Component, option);
}
