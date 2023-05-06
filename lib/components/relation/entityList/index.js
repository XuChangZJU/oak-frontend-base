"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OakComponent({
    isList: true,
    formData: function () {
        var entities = this.features.relationAuth.getAllEntities();
        return {
            entities: entities,
        };
    },
    properties: {
        onEntityClicked: function (entity) { return undefined; },
    },
    methods: {
        onEntityClicked: function (entity) {
            this.props.onEntityClicked(entity);
        }
    }
});
