import * as React from 'react';
import PullToRefresh from 'rmc-pull-to-refresh';
import LoadingIcon from './LoadingIcon';
// import 'rmc-pull-to-refresh/assets/index.css';
import './index.css';

const OakPullToRefresh: React.FC<any> = (props) => {
    return (
        <PullToRefresh
            {...props}
            getScrollContainer={() => document.body}
            indicator={{
                activate: <LoadingIcon />,
                deactivate: <LoadingIcon />,
                release: <LoadingIcon animate={true} />,
                finish: <LoadingIcon />,
            }}
        />
    );
};

export default OakPullToRefresh;
