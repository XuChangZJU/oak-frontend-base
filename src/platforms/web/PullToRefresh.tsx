import React from 'react';
import PullToRefresh from 'rmc-pull-to-refresh';
import 'rmc-pull-to-refresh/assets/index.css';

const OakPullToRefresh: React.FC<any> = (props) => {
    return (
        <PullToRefresh
            {...props}
            getScrollContainer={() => document.body}
        />
    );
};

export default OakPullToRefresh;
