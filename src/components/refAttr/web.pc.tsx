import React from 'react';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import {
    Form,
    Input,
    InputNumber,
    Radio,
    Modal,
    Button,
    DatePicker,
    Space,
    Cascader,
    Select,
    Tag,
    Switch,
} from 'antd';
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
const { TextArea } = Input;
import dayjs from 'dayjs';
import { AttrRender, AttrUpsertRender, OakAbsRefAttrPickerDef, OakAbsRefAttrPickerRender, OakNativeAttrUpsertRender } from '../../types/AbstractComponent';
import { WebComponentProps } from '../../types/Page';
import assert from 'assert';
import Picker from '../picker';


type ED = EntityDict & BaseEntityDict;

export default function render(props: WebComponentProps<
    ED,
    keyof EntityDict,
    false,
    {
        multiple: boolean;
        renderValue: string;
        data?: { id: string, title: string }[];
        pickerDef: OakAbsRefAttrPickerDef<ED, keyof ED>;
        pickerEntity?: keyof ED;
        pickerProjection?: ED[keyof ED]['Selection']['data'];
        pickerFilter?: ED[keyof ED]['Selection']['filter'];
        pickerTitleFn?: (data: any) => string;
        pickerTitleLabel?: string;
        pickerAttr?: string;
        pickerDialogTitle?: string;
    },
    {
        openPicker: (attr: string) => void;
        closePicker: () => void;
    }
>) {
    const { pickerDef, pickerEntity, pickerProjection, pickerFilter, pickerAttr,
        pickerDialogTitle, pickerTitleFn, pickerTitleLabel } = props.data;
    const { mode } = pickerDef;

    switch (mode) {
        case 'select': {

            break;
        }
    }
}