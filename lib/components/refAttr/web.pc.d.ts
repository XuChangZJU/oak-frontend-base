import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { OakAbsRefAttrPickerDef } from '../../types/AbstractComponent';
import { WebComponentProps } from '../../types/Page';
declare type ED = EntityDict & BaseEntityDict;
export default function render(props: WebComponentProps<ED, keyof EntityDict, false, {
    multiple: boolean;
    renderValue: string;
    data?: {
        id: string;
        title: string;
    }[];
    pickerDef: OakAbsRefAttrPickerDef<ED, keyof ED>;
    pickerEntity?: keyof ED;
    pickerProjection?: ED[keyof ED]['Selection']['data'];
    pickerFilter?: ED[keyof ED]['Selection']['filter'];
    pickerTitleFn?: (data: any) => string;
    pickerTitleLabel?: string;
    pickerAttr?: string;
    pickerDialogTitle?: string;
}, {
    openPicker: (attr: string) => void;
    closePicker: () => void;
}>): void;
export {};
