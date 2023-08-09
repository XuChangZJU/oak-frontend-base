import { Breakpoint } from 'antd';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ColorDict } from 'oak-domain/lib/types/Style';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { AttrRender } from '../../types/AbstractComponent';
export default function Render(props: WebComponentProps<EntityDict & BaseEntityDict, keyof EntityDict, false, {
    entity: string;
    title: string;
    bordered: boolean;
    layout: 'horizontal' | 'vertical';
    handleClick?: (id: string, action: string) => void;
    colorDict: ColorDict<EntityDict & BaseEntityDict>;
    dataSchema: StorageSchema<EntityDict>;
    column: number | Record<Breakpoint, number>;
    renderData: AttrRender[];
}, {}>): import("react/jsx-runtime").JSX.Element;
