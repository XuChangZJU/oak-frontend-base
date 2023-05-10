"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
var lodash_1 = require("oak-domain/lib/utils/lodash");
exports.default = OakComponent({
    entity: 'directActionAuth',
    isList: true,
    projection: {
        id: 1,
        deActions: 1,
        path: 1,
        destEntity: 1,
        sourceEntity: 1,
    },
    properties: {
        entity: '',
        actions: [],
    },
    filters: [
        {
            filter: function () {
                var _a = this.props, entity = _a.entity, actions = _a.actions;
                if (!actions || actions.length === 0) {
                    return {
                        destEntity: entity,
                    };
                }
                return {
                    destEntity: entity,
                    deActions: {
                        $overlaps: actions,
                    },
                };
            }
        }
    ],
    formData: function (_a) {
        var data = _a.data;
        var entity = this.props.entity;
        var paths = this.features.relationAuth.getCascadeActionAuths(entity, false);
        return {
            paths: paths,
            directActionAuths: data,
        };
    },
    methods: {
        onChange: function (checked, path, directActionAuth) {
            var actions = this.props.actions;
            (0, assert_1.default)(actions.length > 0);
            if (checked) {
                if (directActionAuth) {
                    var deActions = directActionAuth.deActions;
                    var deActions2 = (0, lodash_1.union)(deActions, actions);
                    this.updateItem({
                        deActions: deActions2,
                    }, directActionAuth.id);
                }
                else {
                    this.addItem({
                        destEntity: path[0],
                        sourceEntity: path[2],
                        path: path[1],
                        deActions: actions,
                    });
                }
            }
            else {
                (0, assert_1.default)(directActionAuth);
                var deActions_1 = directActionAuth.deActions;
                actions === null || actions === void 0 ? void 0 : actions.forEach(function (action) { return (0, lodash_1.pull)(deActions_1, action); });
                this.updateItem({
                    deActions: deActions_1,
                }, directActionAuth.id);
            }
        },
        confirm: function () {
            this.execute();
        },
    }
});
