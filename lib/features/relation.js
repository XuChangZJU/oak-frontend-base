"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Relation = void 0;
var tslib_1 = require("tslib");
var Feature_1 = require("../types/Feature");
var string_1 = require("oak-domain/lib/utils/string");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var Relation = /** @class */ (function (_super) {
    tslib_1.__extends(Relation, _super);
    function Relation(cache, relationDict) {
        var _this = _super.call(this) || this;
        _this.cache = cache;
        _this.relationDict = relationDict;
        return _this;
    }
    Relation.prototype.getChildrenRelations = function (entity, userId, entityId) {
        var _a;
        var _this = this;
        var relationEntity = "user".concat((0, string_1.firstLetterUpperCase)(entity));
        var userRelations = this.cache.get(relationEntity, {
            data: {
                id: 1,
                relation: 1,
            },
            filter: (_a = {
                    userId: userId
                },
                _a["".concat(entity, "Id")] = entityId,
                _a)
        });
        if (userRelations.length > 0) {
            var relations = userRelations.map(function (ele) { return ele.relation; });
            var childrenRelations_1 = [];
            relations.forEach(function (relation) {
                if (_this.relationDict[entity] && _this.relationDict[entity][relation]) {
                    childrenRelations_1.push.apply(childrenRelations_1, tslib_1.__spreadArray([], tslib_1.__read(_this.relationDict[entity][relation]), false));
                }
            });
            if (childrenRelations_1.length > 0) {
                return (0, lodash_1.uniq)(childrenRelations_1);
            }
        }
    };
    return Relation;
}(Feature_1.Feature));
exports.Relation = Relation;
