import React, { useEffect } from 'react';
import {
    Input,
} from 'antd';
import { ActionDef, WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';

import { EntityDict } from 'oak-domain/lib/types/Entity';

const { Search } = Input;

export default function Render(
    props: WebComponentProps<
        ED,
        keyof EntityDict,
        false,
        {
            searchValue: string;
        },
        {
            searchChange: (value: string) => void;
            searchConfirm: (value: string) => void;
        }
    >
) {
    const { methods, data } = props;
    const { t, searchChange, searchConfirm } = methods;
    const {
        searchValue,
        oakLoading,
    } = data;
    return (
        <Search
            loading={oakLoading}
            value={searchValue}
            onChange={({ target: { value } }) =>
                searchChange(value)
            }
            onSearch={(value) => searchConfirm(value)}
            placeholder=""
            allowClear
        />
    );
}
