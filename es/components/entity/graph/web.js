import { jsx as _jsx } from "react/jsx-runtime";
import Styles from './web.module.less';
export default function render(props) {
    const { t } = props.methods;
    return (_jsx("div", { className: Styles.container, children: t('useWideScreen') }));
}
