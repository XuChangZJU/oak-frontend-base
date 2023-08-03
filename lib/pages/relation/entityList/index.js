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
    properties: {
        onEntityClicked: function (entity) { return undefined; },
    },
    methods: {
        onEntityClicked: function (entity) {
            if (this.props.onEntityClicked) {
                this.props.onEntityClicked(entity);
            }
            else {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('直接使用relation/entityList作为page用法即将废除，请使用自定义页面包裹');
                }
                this.features.navigator.navigateTo({
                    url: '/relation/entity',
                }, {
                    entity: entity,
                });
            }
        },
    }
});
