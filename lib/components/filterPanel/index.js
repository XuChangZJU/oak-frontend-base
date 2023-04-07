"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OakComponent({
    entity: function () {
        var entity = this.props.entity;
        return entity;
    },
    isList: true,
    data: {
        open: false,
    },
    properties: {
        entity: '',
        columns: [],
    },
    methods: {
        getNamedFilters: function () {
            if (this.state.oakFullpath) {
                var namedFilters = this.features.runningTree.getNamedFilters(this.state.oakFullpath);
                return namedFilters;
            }
            return [];
        },
    },
});
