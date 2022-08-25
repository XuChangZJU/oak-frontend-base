import React from 'react';
import PullToRefresh from 'rmc-pull-to-refresh';
import './index.css';

const OakPullToRefresh: React.FC<any> = (props) => {
    return (
        <PullToRefresh
            {...props}
            getScrollContainer={() => document.body}
        />
    );
};

export default OakPullToRefresh;
