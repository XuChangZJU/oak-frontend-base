import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Spin } from 'antd';
import { WebComponentProps } from '../../../types/Page';

import type { ColumnsType, ColumnType, ColumnGroupType } from 'antd/es/table';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { Checkbox } from 'antd-mobile';
type ED = EntityDict & BaseEntityDict;

export default function Render(
    props: WebComponentProps<
        EntityDict & BaseEntityDict,
        keyof EntityDict,
        false,
        {
        },
        {
        }
    >
) {
    const { methods, data } = props;
    const { t } = methods;
    const {
       
    } = data;
    return (
        <div>
           待开发
        </div>
    );
}
