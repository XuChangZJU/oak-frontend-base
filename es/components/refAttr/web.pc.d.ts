import React from 'react';
import { OakAbsRefAttrPickerRender, ED } from '../../types/AbstractComponent';
import { WebComponentProps } from '../../types/Page';
import { StorageSchema } from 'oak-domain/lib/types';
export default function render(props: WebComponentProps<ED, keyof ED, false, {
    entityIds: string[];
    multiple: boolean;
    renderValue: string;
    data?: {
        id: string;
        title: string;
    }[];
    pickerRender: OakAbsRefAttrPickerRender<ED, keyof ED>;
    onChange: (value: string[]) => void;
    placeholder: string;
    schema: StorageSchema<ED>;
}>): React.JSX.Element;
