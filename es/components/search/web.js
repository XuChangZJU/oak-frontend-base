import React from 'react';
import { SearchBar } from 'antd-mobile';
export default function Render(props) {
    const { methods, data } = props;
    const { t, searchChange, searchConfirm, searchClear } = methods;
    const { searchValue, placeholder = '请输入' } = data;
    return (<SearchBar value={searchValue} placeholder={placeholder} showCancelButton onChange={searchChange} onSearch={searchConfirm} onClear={() => searchClear()}/>);
}
