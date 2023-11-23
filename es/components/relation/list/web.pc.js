import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Button, Input } from 'antd';
import Styles from './web.pc.module.less';
export default function render(props) {
    const { entities, entity, relations, onClicked } = props.data;
    const { t, setEntityFilter } = props.methods;
    if (entities) {
        return (_jsxs(_Fragment, { children: [!entity &&
                    _jsx(_Fragment, { children: _jsx("div", { className: Styles.inputDiv, children: _jsx(Input, { placeholder: t('searchTip'), allowClear: true, onChange: ({ currentTarget }) => setEntityFilter(currentTarget.value) }) }) }), entities.map((e) => {
                    const rs = relations.filter(ele => ele.entity === e);
                    return (_jsx(Card, { title: t(`${e}:name`) + ` (${e})`, style: { margin: 10 }, children: rs.map((r) => (_jsx(Button, { type: r.entityId ? 'primary' : 'link', onClick: () => onClicked(r.id), children: t(`${e}:r.${r.name}`) + ` (${r.name})` }))) }));
                })] }));
    }
    return null;
}
