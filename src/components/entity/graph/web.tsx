import React from 'react';

import { RowWithActions, WebComponentProps } from '../../../types/Page';
import { ED } from '../../../types/AbstractComponent';

import Styles from './web.module.less';

export default function render(
    props: WebComponentProps<
        ED,
        keyof ED,
        true,
        {
            data: Array<{ name: string; x?: number; y?: number }>;
            links: Array<{ source: string; target: string }>;
        },
        {
            onEntityClicked: (entity: string) => void;
        }
    >
) {
    const { t } = props.methods;
    return <div className={Styles.container}>{t('useWideScreen')}</div>;
}
