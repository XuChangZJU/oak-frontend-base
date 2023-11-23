import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AttrUpsertRender } from '../../types/AbstractComponent';
import { WebComponentProps } from '../../types/Page';
type ED = EntityDict & BaseEntityDict;
export default function render<T extends keyof ED>(props: WebComponentProps<ED, T, false, {
    entity: keyof ED;
    renderData: AttrUpsertRender<ED, T>[];
    helps?: Record<string, string>;
    layout?: 'horizontal' | 'vertical';
    children: any;
}>): import("react/jsx-runtime").JSX.Element;
export {};
