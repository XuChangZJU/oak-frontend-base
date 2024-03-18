import React from 'react';
import { Input, } from 'antd';
const { Search } = Input;
export default function Render(props) {
    const { methods, data } = props;
    const { t, searchChange, searchConfirm } = methods;
    const { searchValue, oakLoading } = data;
    return (<Search loading={oakLoading} value={searchValue} onChange={({ target: { value } }) => searchChange(value)} onSearch={(value) => searchConfirm(value)} placeholder="" allowClear/>);
}
