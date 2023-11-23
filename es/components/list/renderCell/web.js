import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { Space, Typography } from 'antd';
import ImgBox from '../../imgBox';
const { Link, Text } = Typography;
export default function Render(props) {
    const { methods, data: oakData } = props;
    const { value, type, color } = oakData;
    if (value === null || value === '' || value === undefined) {
        return (_jsx(_Fragment, { children: "--" }));
    }
    else if (type === 'image') {
        if (value instanceof Array) {
            return (_jsx(Space, { children: value.map((ele) => (_jsx(ImgBox, { src: ele, width: 100, height: 60 }))) }));
        }
        return (_jsx(ImgBox, { src: value, width: 100, height: 60 }));
    }
    else if (type === 'link') {
        if (value instanceof Array) {
            return (_jsx(Space, { direction: "vertical", children: value.map((ele) => (_jsx(Link, { href: ele, target: "_blank", ellipsis: true, children: ele }))) }));
        }
        return (_jsx(Link, { href: value, target: "_blank", ellipsis: true, children: value }));
    }
    return (_jsx(Text, { ellipsis: true, children: value }));
}
