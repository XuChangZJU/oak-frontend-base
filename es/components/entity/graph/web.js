import React from 'react';
import Styles from './web.module.less';
export default function render(props) {
    const { t } = props.methods;
    return <div className={Styles.container}>{t('useWideScreen')}</div>;
}
