import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { List, Tag, Input } from 'antd-mobile';
import Styles from './web.module.less';
export default function render(props) {
    const { entities, entity, relations, onClicked } = props.data;
    const { t, setEntityFilter } = props.methods;
    if (entities) {
        return (_jsxs(_Fragment, { children: [!entity &&
                    _jsx(_Fragment, { children: _jsx("div", { className: Styles.inputDiv, children: _jsx(Input, { placeholder: t('searchTip'), clearable: true, onChange: (val) => setEntityFilter(val) }) }) }), entities.map((e) => {
                    const rs = relations.filter(ele => ele.entity === e);
                    return (_jsx(List, { header: t(`${e}:name`) + ` (${e})`, children: rs.map((r) => (_jsx(List.Item, { extra: r.entityId && _jsx(Tag, { color: 'primary', fill: 'outline', children: t('hasEntityId') }), onClick: () => onClicked(r.id), children: t(`${e}:r.${r.name}`) + ` (${r.name})` }))) }));
                })] }));
    }
    return null;
}
