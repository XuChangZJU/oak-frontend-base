"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var list_1 = tslib_1.__importDefault(require("../../list"));
var filterPanel_1 = tslib_1.__importDefault(require("../../filterPanel"));
var assert_1 = tslib_1.__importDefault(require("assert"));
function render(props) {
    var _a = props.data, relations = _a.relations, oakLoading = _a.oakLoading, oakFullpath = _a.oakFullpath, hasRelationEntites = _a.hasRelationEntites, onActionClicked = _a.onActionClicked, onRelationClicked = _a.onRelationClicked;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(filterPanel_1.default, { entity: "relation", oakPath: oakFullpath, columns: [
                    {
                        attr: 'entity',
                        selectProps: {
                            options: hasRelationEntites ? hasRelationEntites.map(function (ele) { return ({
                                label: ele,
                                value: ele,
                            }); }) : [],
                        }
                    },
                    {
                        attr: 'entityId',
                    },
                ] }), (0, jsx_runtime_1.jsx)(list_1.default, { entity: "relation", loading: oakLoading, data: relations || [], attributes: ['entity', 'entityId', 'name', 'display'], attributesMb: {
                    title: 'title',
                    rows: ['entity', 'entityId', 'name', 'display'],
                }, extraActions: ['action', 'relation'], onAction: function (row, action) {
                    var id = row.id, entity = row.entity;
                    if (action === 'action') {
                        onActionClicked(id, entity);
                    }
                    else {
                        (0, assert_1.default)(action === 'relation');
                        onRelationClicked(id, entity);
                    }
                } })] }));
}
exports.default = render;
