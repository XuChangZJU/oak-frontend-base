"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const list_1 = tslib_1.__importDefault(require("../../../components/list"));
const filterPanel_1 = tslib_1.__importDefault(require("../../../components/filterPanel"));
const assert_1 = require("oak-domain/lib/utils/assert");
function render(props) {
    const { relations, oakLoading, oakFullpath, hasRelationEntites } = props.data;
    const { onActionClicked, onRelationClicked } = props.methods;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(filterPanel_1.default, { entity: "relation", oakPath: oakFullpath, columns: [
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
                ] }), (0, jsx_runtime_1.jsx)(list_1.default, { entity: "relation", loading: oakLoading, data: relations || [], attributes: ['entity', 'entityId', 'name', 'display'], extraActions: [{ action: 'action', label: '动作', show: true }, { action: 'relation', label: '关系', show: true }], onAction: (row, action) => {
                    const { id, entity } = row;
                    if (action === 'action') {
                        onActionClicked(id, entity);
                    }
                    else {
                        (0, assert_1.assert)(action === 'relation');
                        onRelationClicked(id, entity);
                    }
                } })] }));
}
exports.default = render;
