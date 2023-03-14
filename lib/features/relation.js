"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Relation = void 0;
var tslib_1 = require("tslib");
var Feature_1 = require("../types/Feature");
var string_1 = require("oak-domain/lib/utils/string");
var Relation = /** @class */ (function (_super) {
    tslib_1.__extends(Relation, _super);
    function Relation(cache, relationDict) {
        var _this = _super.call(this) || this;
        _this.cache = cache;
        _this.relationDict = relationDict;
        return _this;
    }
    /**
     * 这里本用户可以访问的relation应该用checker去逐个检查
     * @param entity
     * @param userId
     * @param entityId
     * @returns
     */
    Relation.prototype.getLegalRelations = function (entity, userId, entityId) {
        var _this = this;
        var relation = this.cache.getSchema()[entity].relation;
        var relationEntity = "user".concat((0, string_1.firstLetterUpperCase)(entity));
        var legalRelations = [];
        relation.forEach(function (ele) {
            var _a;
            var legal = _this.cache.checkOperation(relationEntity, 'create', (_a = {
                    relation: ele
                },
                _a["".concat(entity, "Id")] = entityId,
                _a), undefined, ['logical', 'logicalRelation', 'relation']);
            if (legal) {
                legalRelations.push(ele);
            }
        });
        return legalRelations;
    };
    return Relation;
}(Feature_1.Feature));
exports.Relation = Relation;
