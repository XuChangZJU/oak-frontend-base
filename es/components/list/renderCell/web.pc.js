import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { Space, Tag, Tooltip, Typography } from 'antd';
import ImgBox from '../../imgBox';
const { Link } = Typography;
export default function Render(props) {
    const { methods, data: oakData } = props;
    const { value, type, color, linkUrl } = oakData;
    if (value === null || value === '' || value === undefined) {
        return (_jsx(_Fragment, { children: "--" }));
    }
    // 属性类型是enum要使用标签
    else if (type === 'enum') {
        let renderColor = color || 'default';
        // web端的Tag组件没有primary 和 danger
        if (renderColor === 'primary') {
            renderColor = 'processing';
        }
        if (renderColor === 'danger') {
            renderColor = 'error';
        }
        return (_jsx(Tag, { color: renderColor, children: value }));
    }
    else if (type === 'image') {
        if (value instanceof Array) {
            return (_jsx(Space, { children: value.map((ele) => (_jsx(ImgBox, { src: ele, width: 120, height: 70 }))) }));
        }
        return (_jsx(ImgBox, { src: value, width: 120, height: 70 }));
    }
    else if (type === 'link') {
        let href = linkUrl;
        if (value instanceof Array) {
            return (_jsx(Space, { direction: "vertical", children: value.map((ele) => {
                    href = ele;
                    if (linkUrl) {
                        href = linkUrl;
                    }
                    return (_jsx(Link, { href: href, children: ele }));
                }) }));
        }
        return (_jsx(Link, { href: href, children: value }));
    }
    return (_jsx(Tooltip, { placement: "topLeft", title: value, children: value }));
}
