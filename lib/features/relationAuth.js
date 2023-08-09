"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationAuth = void 0;
var tslib_1 = require("tslib");
var types_1 = require("oak-domain/lib/types");
var Feature_1 = require("../types/Feature");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var RelationAuth_1 = require("oak-domain/lib/store/RelationAuth");
var relation_1 = require("oak-domain/lib/store/relation");
var RelationAuth = /** @class */ (function (_super) {
    tslib_1.__extends(RelationAuth, _super);
    function RelationAuth(aspectWrapper, contextBuilder, cache, actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, selectFreeEntities) {
        var _this = _super.call(this) || this;
        _this.aspectWrapper = aspectWrapper;
        _this.contextBuilder = contextBuilder;
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
        _this.buildEntityGraph();
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
    RelationAuth.prototype.buildEntityGraph = function () {
        var e_1, _a;
        var _b, _c, _d, _e;
        var schema = this.cache.getSchema();
        // 构建出一张图来
        var data = [];
        var links = [];
        var nodeOutSet = {};
        var nodeInSet = {};
        var ExcludeEntities = ['modi', 'modiEntity', 'oper', 'operEntity', 'relation', 'relationAuth', 'actionAuth', 'userRelation'];
        var _loop_1 = function (entity) {
            if (ExcludeEntities.includes(entity)) {
                return "continue";
            }
            var attributes = schema[entity].attributes;
            for (var attr in attributes) {
                var ref = attributes[attr].ref;
                if (ref instanceof Array) {
                    ref.forEach(function (reff) {
                        var _a;
                        if (reff === entity || ExcludeEntities.includes(reff) || ((_a = nodeOutSet[entity]) === null || _a === void 0 ? void 0 : _a.includes(reff))) {
                            return;
                        }
                        if (nodeInSet[reff]) {
                            nodeInSet[reff].push(entity);
                        }
                        else {
                            nodeInSet[reff] = [entity];
                        }
                        if (nodeOutSet[entity]) {
                            nodeOutSet[entity].push(reff);
                        }
                        else {
                            nodeOutSet[entity] = [reff];
                        }
                    });
                }
                else if (ref && ref !== entity && !ExcludeEntities.includes(ref) && !((_b = nodeOutSet[entity]) === null || _b === void 0 ? void 0 : _b.includes(ref))) {
                    if (nodeInSet[ref]) {
                        nodeInSet[ref].push(entity);
                    }
                    else {
                        nodeInSet[ref] = [entity];
                    }
                    if (nodeOutSet[entity]) {
                        // 如果外键ref是user 使用属性名(user)以解决relation/entityList页面授权路径不对的问题
                        if (ref === "user") {
                            nodeOutSet[entity].push("".concat(attr.replace('Id', ''), "(").concat(ref, ")"));
                        }
                        else {
                            nodeOutSet[entity].push(ref);
                        }
                    }
                    else {
                        nodeOutSet[entity] = [ref];
                    }
                }
            }
        };
        for (var entity in schema) {
            _loop_1(entity);
        }
        // 把完全独立的对象剥离
        var entities = (0, lodash_1.union)(Object.keys(nodeOutSet), Object.keys(nodeInSet));
        entities.forEach(function (entity) { return data.push({ name: entity }); });
        // link上的value代表其长度。出入度越多的结点，其关联的边的value越大，以便于上层用引力布局渲染
        for (var entity in nodeOutSet) {
            var fromValue = nodeOutSet[entity].length + ((_c = nodeInSet[entity]) === null || _c === void 0 ? void 0 : _c.length) || 0;
            try {
                for (var _f = (e_1 = void 0, tslib_1.__values(nodeOutSet[entity])), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var target = _g.value;
                    var toValue = ((_d = nodeOutSet[target]) === null || _d === void 0 ? void 0 : _d.length) || 0 + ((_e = nodeInSet[target]) === null || _e === void 0 ? void 0 : _e.length) || 0;
                    links.push({
                        source: entity,
                        target: target,
                        value: fromValue + toValue,
                    });
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        this.entityGraph = {
            data: data,
            links: links,
        };
    };
    RelationAuth.prototype.getEntityGraph = function () {
        var _a = this.entityGraph, data = _a.data, links = _a.links;
        return {
            data: data,
            links: links,
        };
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
    RelationAuth.prototype.getRelations = function (entity) {
        var schema = this.cache.getSchema();
        return schema[entity].relation;
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
    RelationAuth.prototype.checkRelation = function (entity, operation) {
        var context = this.contextBuilder();
        context.begin();
        try {
            this.baseRelationAuth.checkRelationSync(entity, operation, context);
        }
        catch (err) {
            context.rollback();
            if (!(err instanceof types_1.OakUserException)) {
                throw err;
            }
            return false;
        }
        context.rollback();
        return true;
    };
    RelationAuth.prototype.getRelationIdByName = function (entity, name, entityId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var filter, relations;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filter = {
                            entity: entity,
                            name: name,
                        };
                        if (entityId) {
                            filter.$or = [
                                {
                                    entityId: entityId,
                                },
                                {
                                    entityId: {
                                        $exists: false,
                                    },
                                }
                            ];
                        }
                        else {
                            filter.entityId = {
                                $exists: false,
                            };
                        }
                        return [4 /*yield*/, this.cache.refresh('relation', {
                                data: {
                                    id: 1,
                                    entity: 1,
                                    entityId: 1,
                                    name: 1,
                                    display: 1,
                                    actionAuth$relation: {
                                        $entity: 'actionAuth',
                                        data: {
                                            id: 1,
                                            paths: 1,
                                            deActions: 1,
                                            destEntity: 1,
                                        },
                                    },
                                },
                                filter: filter,
                            })];
                    case 1:
                        relations = (_a.sent()).data;
                        if (relations.length === 2) {
                            return [2 /*return*/, relations.find(function (ele) { return ele.entityId; }).id];
                        }
                        return [2 /*return*/, relations[0].id];
                }
            });
        });
    };
    RelationAuth.IgnoredActions = ['download', 'aggregate', 'count', 'stat'];
    return RelationAuth;
}(Feature_1.Feature));
exports.RelationAuth = RelationAuth;
