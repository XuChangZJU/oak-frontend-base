import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Breadcrumb, Divider } from 'antd';
export default function Render(props) {
    const { items, title } = props;
    const items2 = items.concat({ title });
    return (_jsxs(_Fragment, { children: [_jsx(Breadcrumb, { items: items2.map((ele) => {
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
                }) }), _jsx(Divider, { style: { marginTop: 4 } })] }));
}
