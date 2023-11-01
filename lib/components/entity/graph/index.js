"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("oak-domain/lib/utils/assert");
exports.default = OakComponent({
    isList: true,
    formData() {
        const { data, links } = this.features.relationAuth.getEntityGraph();
        return {
            data,
            links,
        };
    },
    properties: {
        onClicked: (entity) => undefined,
    },
    methods: {
        onEntityClicked(entity) {
            (0, assert_1.assert)(this.props.onClicked);
            this.props.onClicked(entity);
        },
    },
});
