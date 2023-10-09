import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import PureList from '../../../components/list';
import FilterPanel from '../../../components/filterPanel';
import { assert } from 'oak-domain/lib/utils/assert';
export default function render(props) {
    const { relations, oakLoading, oakFullpath, hasRelationEntites } = props.data;
    const { onActionClicked, onRelationClicked } = props.methods;
    return (_jsxs(_Fragment, { children: [_jsx(FilterPanel, { entity: "relation", oakPath: oakFullpath, columns: [
                    {
                        attr: 'entity',
                        selectProps: {
                            options: hasRelationEntites ? hasRelationEntites.map(ele => ({
                                label: ele,
                                value: ele,
                            })) : [],
                        }
                    },
                    {
                        attr: 'entityId',
                    },
                ] }), _jsx(PureList, { entity: "relation", loading: oakLoading, data: relations || [], attributes: ['entity', 'entityId', 'name', 'display'], extraActions: [{ action: 'action', label: '动作', show: true }, { action: 'relation', label: '关系', show: true }], onAction: (row, action) => {
                    const { id, entity } = row;
                    if (action === 'action') {
                        onActionClicked(id, entity);
                    }
                    else {
                        assert(action === 'relation');
                        onRelationClicked(id, entity);
                    }
                } })] }));
}
