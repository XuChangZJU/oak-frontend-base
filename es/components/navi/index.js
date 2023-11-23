import React from 'react';
import { Breadcrumb, Divider } from 'antd';
export default function Render(props) {
    const { items, title } = props;
    const items2 = items.concat({ title });
    return (<>
            <Breadcrumb items={items2.map((ele) => {
            const { title, href } = ele;
            if (href) {
                return {
                    title,
                    href,
                };
            }
            return {
                title,
            };
        })}/>
            <Divider style={{ marginTop: 4 }}/>
        </>);
}
