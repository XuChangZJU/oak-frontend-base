"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationAuth = void 0;
var tslib_1 = require("tslib");
var Feature_1 = require("../types/Feature");
var RelationAuth_1 = require("oak-domain/lib/store/RelationAuth");
var relation_1 = require("oak-domain/lib/store/relation");
var RelationAuth = /** @class */ (function (_super) {
    tslib_1.__extends(RelationAuth, _super);
    function RelationAuth(aspectWrapper, cache, actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, selectFreeEntities) {
        var _this = _super.call(this) || this;
        _this.aspectWrapper = aspectWrapper,
            _this.cache = cache;
        _this.actionCascadePathGraph = actionCascadePathGraph;
        _this.relationCascadePathGraph = relationCascadePathGraph;
        _this.actionCascadePathMap = {};
        actionCascadePathGraph.forEach(function (ele) {
            var _a = tslib_1.__read(ele, 1), entity = _a[0];
            if (_this.actionCascadePathMap[entity]) {
                _this.actionCascadePathMap[entity].push(ele);
            }
            else {
                _this.actionCascadePathMap[entity] = [ele];
            }
        });
        _this.authDeduceRelationMap = authDeduceRelationMap;
        _this.baseRelationAuth = new RelationAuth_1.RelationAuth(cache.getSchema(), actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, selectFreeEntities);
        return _this;
    }
    RelationAuth.prototype.judgeRelation = function (entity, attr) {
        return (0, relation_1.judgeRelation)(this.cache.getSchema(), entity, attr);
    };
    RelationAuth.prototype.getHasRelationEntities = function () {
        var schema = this.cache.getSchema();
        var entities = Object.keys(schema).filter(function (ele) { return !!schema[ele].relation; });
        return entities;
    };
    RelationAuth.prototype.getDeduceRelationAttribute = function (entity) {
        return this.authDeduceRelationMap[entity];
    };
    RelationAuth.prototype.getAllEntities = function () {
        return Object.keys(this.cache.getSchema());
    };
    RelationAuth.prototype.getActions = function (entity) {
        return this.cache.getSchema()[entity].actions.filter(function (ele) { return !RelationAuth.IgnoredActions.includes(ele); });
    };
    RelationAuth.prototype.hasRelation = function (entity) {
        var schema = this.cache.getSchema();
        return !!schema[entity].relation;
    };
    RelationAuth.prototype.getCascadeActionEntitiesBySource = function (entity) {
        var _this = this;
        var paths = this.actionCascadePathGraph.filter(function (ele) { return ele[2] === entity && ele[3]; });
        return paths.map(function (ele) { return ({
            path: ele,
            actions: _this.cache.getSchema()[ele[0]].actions.filter(function (ele) { return !RelationAuth.IgnoredActions.includes(ele); }),
        }); });
    };
    RelationAuth.prototype.getCascadeActionAuths = function (entity, ir) {
        var paths = this.actionCascadePathGraph.filter(function (ele) { return ele[0] === entity && ir === ele[3]; });
        return paths;
    };
    RelationAuth.prototype.getCascadeRelationAuthsBySource = function (entity) {
        var relationAuths = this.relationCascadePathGraph.filter(function (ele) { return ele[2] === entity && ele[3]; });
        return relationAuths;
    };
    RelationAuth.prototype.getCascadeRelationAuths = function (entity, ir) {
        var relationAuths = this.relationCascadePathGraph.filter(function (ele) { return ele[0] === entity && ir === ele[3]; });
        return relationAuths;
    };
    RelationAuth.prototype.checkRelation = function (entity, operation, context) {
        this.baseRelationAuth.checkRelationSync(entity, operation, context);
    };
    RelationAuth.IgnoredActions = ['download', 'aggregate', 'count', 'stat'];
    return RelationAuth;
}(Feature_1.Feature));
exports.RelationAuth = RelationAuth;
