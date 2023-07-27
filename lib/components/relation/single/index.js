"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
exports.default = OakComponent({
    isList: false,
    properties: {
        entity: '',
    },
    formData: function (_a) {
        var rows = _a.data;
        return {};
    },
    data: {
        links: [],
        entityDNode: [],
        entitySNode: [],
    },
    lifetimes: {
        ready: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var entity, links;
                var _this = this;
                return tslib_1.__generator(this, function (_a) {
                    entity = this.props.entity;
                    links = this.features.relationAuth.getEntityGraph().links;
                    this.setState({
                        links: links,
                    }, function () {
                        _this.getNodes(entity);
                    });
                    return [2 /*return*/];
                });
            });
        }
    },
    methods: {
        getNodes: function (entity) {
            var links = this.state.links;
            // 以entity为source 查找entity所指向的实体
            var entityDNode = links.filter(function (ele) { return ele.source === entity; }).map(function (ele) { return ele.target; });
            // 以entity为target 查找指向entity的实体
            var entitySNode = links.filter(function (ele) { return ele.target === entity; }).map(function (ele) { return ele.source; });
            this.setState({
                entityDNode: entityDNode,
                entitySNode: entitySNode,
            });
        },
        // 检查在当前路径下，是否有授权操作，如果有需要先保存
        checkSelectRelation: function () {
            var operations = this.features.runningTree.getOperations('$actionAuthList-cpn');
            var showExecuteTip = false;
            if (operations && operations.length) {
                showExecuteTip = true;
                this.setMessage({
                    content: '请先保存当前授权',
                    type: 'warning',
                });
            }
            return showExecuteTip;
        }
    }
});
