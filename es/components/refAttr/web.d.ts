import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { OakAbsRefAttrPickerRender } from '../../types/AbstractComponent';
import { WebComponentProps } from '../../types/Page';
import { StorageSchema } from 'oak-domain/lib/types';
declare type ED = EntityDict & BaseEntityDict;
export default function render(props: WebComponentProps<ED, keyof EntityDict, false, {
    entityId: string;
    entityIds: string[];
    multiple: boolean;
    renderValue: string;
    data?: {
        id: string;
        title: string;
    }[];
    pickerRender: OakAbsRefAttrPickerRender<ED, keyof ED>;
    onChange: (value: string[]) => void;
    schema: StorageSchema<EntityDict & BaseEntityDict>;
}>): import("react/jsx-runtime").JSX.Element;
export {};