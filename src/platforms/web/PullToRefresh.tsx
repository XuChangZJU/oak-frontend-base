import React from 'react';
import PullToRefresh from 'rmc-pull-to-refresh';
import './PullToRefresh.css';


const OakPullToRefresh: React.FC<any> = (props) => {
    return <PullToRefresh {...props} prefixCls="oak-pull-to-refresh" />;
};

export default OakPullToRefresh;
