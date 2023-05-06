"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OakComponent({
    isList: false,
    properties: {
        entity: '',
    },
    data: {
        action: '',
    },
    formData: function () {
        var entity = this.props.entity;
        var actions = this.features.relationAuth.getActions(entity);
        return {
            actions: actions,
        };
    },
    methods: {
        onActionSelected: function (action) {
            this.setState({ action: action });
        }
    }
});
