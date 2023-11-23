import React from 'react';
import PullToRefresh from 'rmc-pull-to-refresh';
import './PullToRefresh.css';
const OakPullToRefresh = (props) => {
    return <PullToRefresh {...props} prefixCls="oak-pull-to-refresh"/>;
};
export default OakPullToRefresh;
