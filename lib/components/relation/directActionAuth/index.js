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
        action: '',
    },
    filters: [
        {
            filter: function () {
                var _a = this.props, entity = _a.entity, action = _a.action;
                if (!action) {
                    return {
                        destEntity: entity,
                    };
                }
                return {
                    destEntity: entity,
                    deActions: {
                        $contains: action,
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
            var action = this.props.action;
            (0, assert_1.default)(action);
            if (checked) {
                if (directActionAuth) {
                    var deActions = directActionAuth.deActions;
                    deActions.push(action);
                    this.updateItem({
                        deActions: deActions,
                    }, directActionAuth.id);
                }
                else {
                    this.addItem({
                        destEntity: path[0],
                        sourceEntity: path[2],
                        path: path[1],
                        deActions: [action],
                    });
                }
            }
            else {
                (0, assert_1.default)(directActionAuth);
                var deActions = directActionAuth.deActions;
                (0, lodash_1.pull)(deActions, action);
                this.updateItem({
                    deActions: deActions,
                }, directActionAuth.id);
            }
        },
        confirm: function () {
            this.execute();
        },
    }
});
