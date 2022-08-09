import * as React from 'react';
import PullToRefresh from 'rmc-pull-to-refresh';
import './index.css';
// import LoadingIcon from './LoadingIcon';

const OakPullToRefresh: React.FC<any> = (props) => {
    return (
        <PullToRefresh
            {...props}
            getScrollContainer={() => document.body}
            // indicator={{
            //     activate: <LoadingIcon />,
            //     deactivate: <LoadingIcon />,
            //     release: <LoadingIcon animate={true} />,
            //     finish: <LoadingIcon />,
            // }}
        />
    );
};

export default OakPullToRefresh;
