import React, {useEffect} from 'react';
import {
    SearchBar
} from 'antd-mobile';
import { ActionDef, WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';

export default function Render(
    props: WebComponentProps<
        ED,
        keyof ED,
        false,
        {
            searchValue: string;
            placeholder: string;
        },
        {
            searchChange: (value: string) => void;
            searchConfirm: (value: string) => void;
            searchClear: () => void;
        }
    >
) {
    const { methods, data } = props;
    const { t, searchChange, searchConfirm, searchClear } = methods;
    const { searchValue, placeholder = '请输入' } = data;

    return (
        <SearchBar
            value={searchValue}
            placeholder={placeholder}
            showCancelButton
            onChange={searchChange}
            onSearch={searchConfirm}
            onClear={() => searchClear()}
        />
    );
}
