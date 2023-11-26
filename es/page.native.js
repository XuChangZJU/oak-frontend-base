import { createComponent as createReactComponent } from './page.react';
const DEFAULT_REACH_BOTTOM_DISTANCE = 50;
export function createComponent(option, features) {
    const BaseComponent = createReactComponent(option, features);
    class Component extends BaseComponent {
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
