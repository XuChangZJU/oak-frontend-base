/// <reference types="react" />
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AttrUpsertRender } from '../../types/AbstractComponent';
import { WebComponentProps } from '../../types/Page';
declare type ED = EntityDict & BaseEntityDict;
export default function render(props: WebComponentProps<ED, keyof EntityDict, false, {
    renderData: AttrUpsertRender<ED>[];
    children: any;
    mtoData: Record<string, Array<{
        id: string;
        title: string;
    }>>;
    pickerEntity?: keyof ED;
    pickerProjection?: ED[keyof ED]['Selection']['data'];
    pickerFilter?: ED[keyof ED]['Selection']['filter'];
    pickerTitleFn?: (data: any) => string;
    pickerTitleLabel?: string;
    pickerAttr?: string;
    pickerDialogTitle?: string;
}, {
    refreshData: (attr: string) => void;
    openPicker: (attr: string) => void;
    closePicker: () => void;
}>): JSX.Element;
export {};
