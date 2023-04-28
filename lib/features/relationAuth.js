"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationAuth = void 0;
var tslib_1 = require("tslib");
var Feature_1 = require("../types/Feature");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var RelationAuth_1 = require("oak-domain/lib/store/RelationAuth");
var assert_1 = tslib_1.__importDefault(require("assert"));
var relation_1 = require("oak-domain/lib/store/relation");
var RelationAuth = /** @class */ (function (_super) {
    tslib_1.__extends(RelationAuth, _super);
    function RelationAuth(aspectWrapper, cache, actionCascadePathGraph, relationCascadePathGraph) {
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
        _this.baseRelationAuth = new RelationAuth_1.RelationAuth(actionCascadePathGraph, relationCascadePathGraph, cache.getSchema());
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
    RelationAuth.prototype.getCascadeActionEntitiesByRoot = function (entity) {
        var _this = this;
        var paths = this.actionCascadePathGraph.filter(function (ele) { return ele[2] === entity; });
        var ignoredActions = ['download', 'aggregate', 'count', 'stat'];
        return paths.map(function (ele) { return ({
            path: ele,
            actions: _this.cache.getSchema()[ele[0]].actions.filter(function (ele) { return !ignoredActions.includes(ele); }),
        }); });
    };
    RelationAuth.prototype.checkRelation = function (entity, operation, context) {
        this.baseRelationAuth.checkRelationSync(entity, operation, context);
    };
    /**
     * 对目标对象的free和direct访问权限，每次需要的时候去后台取到缓存中
     * @param entity
     */
    RelationAuth.prototype.tryGetFreeAndDirectActionAuthInfo = function (entity) {
        var freeActionAuths = this.cache.get('freeActionAuth', {
            data: {
                id: 1,
            },
            filter: {
                destEntity: entity,
            },
        });
        if (freeActionAuths.length === 0) {
            this.cache.refresh('freeActionAuth', {
                data: {
                    id: 1,
                    deActions: 1,
                    destEntity: 1,
                },
                filter: {
                    destEntity: entity,
                },
            });
        }
        var directActionAuths = this.cache.get('directActionAuth', {
            data: {
                id: 1,
            },
            filter: {
                destEntity: entity,
            },
        });
        if (directActionAuths.length === 0) {
            this.cache.refresh('directActionAuth', {
                data: {
                    id: 1,
                    path: 1,
                    deActions: 1,
                    destEntity: 1,
                },
                filter: {
                    destEntity: entity,
                },
            });
        }
    };
    /**
     * 根据对目标对象可能的action，去获取相关可能的relation结构的数据
     * @param entity
     * @param userId
     * @param actions
     */
    RelationAuth.prototype.getRelationalProjection = function (entity, userId, actions) {
        var _this = this;
        var paths = this.actionCascadePathMap[entity];
        var irurProjection = {
            $entity: 'userRelation',
            data: {
                id: 1,
                relationId: 1,
                relation: {
                    id: 1,
                    name: 1,
                    display: 1,
                    actionAuth$relation: {
                        $entity: 'actionAuth',
                        data: {
                            id: 1,
                            path: 1,
                            destEntity: 1,
                            deActions: 1,
                            relationId: 1,
                        },
                        filter: {
                            path: '',
                            destEntity: entity,
                            deActions: {
                                $overlaps: actions,
                            }
                        }
                    }
                }
            },
            filter: {
                userId: userId,
            },
        };
        this.tryGetFreeAndDirectActionAuthInfo(entity);
        if (paths) {
            var projection_1 = {};
            paths.forEach(function (_a) {
                var _b = tslib_1.__read(_a, 4), e = _b[0], p = _b[1], r = _b[2], ir = _b[3];
                var ps = p.split('.');
                if (ps.length === 0) {
                    (0, assert_1.default)(ir);
                    Object.assign(projection_1, {
                        userRelation$entity: irurProjection
                    });
                }
                else if (ir) {
                    (0, lodash_1.set)(projection_1, "p.userRelation$entity", irurProjection);
                }
                else {
                    // 这里最好不要产生user: { id: 1 }的格式，在倒数第二层进行处理
                    var entity_1 = r;
                    var attr = ps.pop();
                    var rel = _this.judgeRelation(entity_1, attr);
                    if (rel === 2) {
                        (0, lodash_1.set)(projection_1, "".concat(ps.join('.'), ".entity"), 1);
                        (0, lodash_1.set)(projection_1, "".concat(ps.join('.'), ".entityId"), 1);
                    }
                    else {
                        (0, lodash_1.set)(projection_1, "".concat(ps.join('.'), ".").concat(attr, "Id"), 1);
                    }
                }
            });
            return projection_1;
        }
    };
    return RelationAuth;
}(Feature_1.Feature));
exports.RelationAuth = RelationAuth;
