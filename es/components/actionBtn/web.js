import React, { useEffect } from 'react';
import { Space, Button, Divider, Popover, Typography, } from 'antd';
import { MoreOutlined, } from '@ant-design/icons';
import Style from './mobile.module.less';
export default function Render(props) {
    const { methods, data } = props;
    const { t, makeItems } = methods;
    const { width, items, moreItems, i18n, } = data;
    const isMobile = width.includes('xs');
    const zhCNKeys = i18n?.store?.data?.zh_CN && Object.keys(i18n.store.data.zh_CN).length;
    useEffect(() => {
        makeItems(isMobile);
    }, [zhCNKeys]);
    return (<div className={Style.container}>
            {items && items.map((ele, index) => (<>
                    <div className={Style.btn} onClick={ele.onClick}>
                        <Typography.Link>
                            {ele.label}
                        </Typography.Link>
                    </div>
                    {index !== items.length - 1 && (<Divider type="vertical"></Divider>)}
                </>))}
            {moreItems && moreItems.length > 0 && (<Divider type="vertical"/>)}
            {moreItems && moreItems.length > 0 && (<Popover placement='topRight' content={<Space direction="vertical">
                            {moreItems.map((ele) => (<Button size="small" type="link" onClick={ele.onClick}>
                                    {ele.label}
                                </Button>))}
                        </Space>} trigger="click">
                    <Button type="link" icon={(<MoreOutlined />)}/>
                </Popover>)}
        </div>);
}
