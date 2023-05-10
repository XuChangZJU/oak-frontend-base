"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
var lodash_1 = require("oak-domain/lib/utils/lodash");
exports.default = OakComponent({
    entity: 'freeActionAuth',
    isList: true,
    projection: {
        id: 1,
        deActions: 1,
        destEntity: 1,
    },
    properties: {
        entity: '',
    },
    filters: [
        {
            filter: function () {
                var entity = this.props.entity;
                return {
                    destEntity: entity,
                };
            }
        }
    ],
    formData: function (_a) {
        var data = _a.data;
        var entity = this.props.entity;
        var actions = this.features.relationAuth.getActions(entity);
        return {
            actions: actions,
            freeActionAuths: data,
        };
    },
    methods: {
        onChange: function (checked, action, freeActionAuth) {
            if (checked) {
                if (freeActionAuth) {
                    var deActions = freeActionAuth.deActions;
                    deActions.push(action);
                    this.updateItem({
                        deActions: deActions,
                    }, freeActionAuth.id);
                }
                else {
                    this.addItem({
                        destEntity: this.props.entity,
                        deActions: [action],
                    });
                }
            }
            else {
                (0, assert_1.default)(freeActionAuth);
                var deActions = freeActionAuth.deActions;
                (0, lodash_1.pull)(deActions, action);
                this.updateItem({
                    deActions: deActions,
                }, freeActionAuth.id);
            }
        },
        confirm: function () {
            this.execute();
        },
    }
});
