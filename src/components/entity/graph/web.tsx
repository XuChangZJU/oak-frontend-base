import { RowWithActions, WebComponentProps } from '../../../types/Page';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';

import Styles from './web.module.less';
type ED = EntityDict & BaseEntityDict;

export default function render(
    props: WebComponentProps<
        ED,
        keyof ED,
        true,
        {
            data: Array<{ name: string, x?: number, y?: number }>;
            links: Array<{ source: string, target: string }>;
        },
        {
            onEntityClicked: (entity: string) => void;
        }
    >
) {
    const { t } = props.methods;
    return (
        <div className={Styles.container}>
            {t('useWideScreen')}
        </div>
    )
}