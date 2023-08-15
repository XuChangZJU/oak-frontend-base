import React from 'react';
import { Breadcrumb, Divider } from 'antd';

type Props = {
    items: Array<{
        title: string;
        href?: string;
    }>;
    title: string;
};

export default function Render(props: Props) {
    const { items, title } = props;
    const items2 = items.concat({ title });

    return (
        <>
            <Breadcrumb items={items2.map(
                (ele) => {
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
                }
            )} />
            <Divider style={{ marginTop: 4 }} />
        </>
    );
}