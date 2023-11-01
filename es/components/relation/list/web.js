import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { List } from 'antd-mobile';
export default function render(props) {
    const { entities, entity, relations, onClicked } = props.data;
    if (entities) {
        return (_jsx(_Fragment, { children: entities.map((e) => {
                const rs = relations.filter(ele => ele.entity === e);
                return (_jsx(List, { header: e, children: rs.map((r) => (_jsx(List.Item, { onClick: () => onClicked(r.id), children: r.name }))) }));
            }) }));
    }
    return null;
}
