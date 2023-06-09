"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OakComponent({
    isList: true,
    formData: function () {
        var _a = this.features.relationAuth.getEntityGraph(), data = _a.data, links = _a.links;
        return {
            data: data,
            links: links,
        };
    },
    methods: {
        onEntityClicked: function (entity) {
            this.features.navigator.navigateTo({
                url: '/relation/entity',
            }, {
                entity: entity,
            });
        },
    }
});
