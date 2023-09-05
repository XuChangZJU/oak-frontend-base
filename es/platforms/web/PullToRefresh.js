import { jsx as _jsx } from "react/jsx-runtime";
import PullToRefresh from 'rmc-pull-to-refresh';
import './PullToRefresh.css';
const OakPullToRefresh = (props) => {
    return _jsx(PullToRefresh, { ...props, prefixCls: "oak-pull-to-refresh" });
};
export default OakPullToRefresh;
