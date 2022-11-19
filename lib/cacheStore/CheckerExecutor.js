"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var checker_1 = require("oak-domain/lib/store/checker");
var CheckerExecutor = /** @class */ (function () {
    function CheckerExecutor() {
        this.checkerMap = {};
    }
    CheckerExecutor.prototype.registerChecker = function (checker) {
        var _this = this;
        var entity = checker.entity, action = checker.action, _a = checker.priority, priority = _a === void 0 ? 1 : _a, type = checker.type;
        var fn = (0, checker_1.translateCheckerInSyncContext)(checker);
        var addCheckerMap = function (action2) {
            var _a, _b, _c;
            if (_this.checkerMap[entity] && _this.checkerMap[entity][action2]) {
                var iter = 0;
                var checkers = _this.checkerMap[entity][action2];
                for (; iter < checkers.length; iter++) {
                    if (priority >= checkers[iter].priority) {
                        break;
                    }
                }
                checkers.splice(iter, 0, {
                    type: type,
                    priority: priority,
                    fn: fn,
                });
            }
            else if (_this.checkerMap[entity]) {
                Object.assign(_this.checkerMap[entity], (_a = {},
                    _a[action2] = [{
                            type: type,
                            priority: priority,
                            fn: fn,
                        }],
                    _a));
            }
            else {
                Object.assign(_this.checkerMap, (_b = {},
                    _b[entity] = (_c = {},
                        _c[action2] = [{
                                type: type,
                                priority: priority,
                                fn: fn,
                            }],
                        _c),
                    _b));
            }
        };
        if (action instanceof Array) {
            action.forEach(function (a) { return addCheckerMap(a); });
        }
        else {
            addCheckerMap(action);
        }
    };
    CheckerExecutor.prototype.check = function (entity, operation, context, checkerTypes) {
        var e_1, _a;
        var action = operation.action;
        var checkers = this.checkerMap[entity] && this.checkerMap[entity][action];
        if (checkers) {
            var checkers2 = checkerTypes ? checkers.filter(function (ele) { return checkerTypes.includes(ele.type); }) : checkers;
            try {
                for (var checkers2_1 = tslib_1.__values(checkers2), checkers2_1_1 = checkers2_1.next(); !checkers2_1_1.done; checkers2_1_1 = checkers2_1.next()) {
                    var checker = checkers2_1_1.value;
                    checker.fn(operation, context);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (checkers2_1_1 && !checkers2_1_1.done && (_a = checkers2_1.return)) _a.call(checkers2_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    };
    return CheckerExecutor;
}());
exports.default = CheckerExecutor;
