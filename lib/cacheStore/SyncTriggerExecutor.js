"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
// 简化版的对checker的同步检查
var assert_1 = require("oak-domain/lib/utils/assert");
var types_1 = require("oak-domain/lib/types");
var checker_1 = require("oak-domain/lib/store/checker");
var filter_1 = require("oak-domain/lib/store/filter");
var SyncTriggerExecutor = /** @class */ (function () {
    function SyncTriggerExecutor() {
        this.checkerMap = {};
    }
    SyncTriggerExecutor.prototype.addToCheckerMap = function (action, entity, priority, when, fn, type, filter) {
        var _a, _b, _c;
        if (this.checkerMap[entity] && this.checkerMap[entity][action]) {
            var iter = 0;
            var checkers = this.checkerMap[entity][action];
            for (; iter < checkers.length; iter++) {
                if (priority <= checkers[iter].priority) {
                    break;
                }
            }
            checkers.splice(iter, 0, {
                type: type,
                priority: priority,
                fn: fn,
                when: when,
                filter: filter,
            });
        }
        else if (this.checkerMap[entity]) {
            Object.assign(this.checkerMap[entity], (_a = {},
                _a[action] = [{
                        type: type,
                        priority: priority,
                        fn: fn,
                        when: when,
                        filter: filter,
                    }],
                _a));
        }
        else {
            Object.assign(this.checkerMap, (_b = {},
                _b[entity] = (_c = {},
                    _c[action] = [{
                            type: type,
                            priority: priority,
                            fn: fn,
                            when: when,
                            filter: filter,
                        }],
                    _c),
                _b));
        }
    };
    SyncTriggerExecutor.prototype.registerChecker = function (checker) {
        var _this = this;
        var entity = checker.entity, action = checker.action, priority = checker.priority, type = checker.type, conditionalFilter = checker.conditionalFilter;
        var _a = (0, checker_1.translateCheckerInSyncContext)(checker), fn = _a.fn, when = _a.when;
        if (action instanceof Array) {
            action.forEach(function (a) { return _this.addToCheckerMap(a, entity, priority || types_1.CHECKER_PRIORITY_MAP[type], when, fn, type, conditionalFilter); });
        }
        else {
            this.addToCheckerMap(action, entity, priority, when, fn, type, conditionalFilter);
        }
    };
    /* registerTrigger<T extends keyof ED>(trigger: Trigger<ED, T, Cxt>) {
        const {
            action,
            entity,
            priority,
            fn,
            when,
            filter,
        } = trigger as UpdateTrigger<ED, T, Cxt>;

        if (when === 'commit') {
            return;
        }
        if (action instanceof Array) {
            action.forEach(
                (a) => this.addToCheckerMap(a, entity, priority || TRIGGER_DEFAULT_PRIORITY, when, fn as any, undefined, filter)
            );
        }
        else {
            this.addToCheckerMap(action ,entity, priority || TRIGGER_DEFAULT_PRIORITY, when, fn as any, undefined, filter);
        }
    } */
    SyncTriggerExecutor.prototype.check = function (entity, operation, context, when, checkerTypes) {
        var e_1, _a;
        var action = operation.action;
        var checkers = this.checkerMap[entity] && this.checkerMap[entity][action];
        if (checkers) {
            var checkers2 = checkers.filter(function (ele) { return (!checkerTypes || checkerTypes.includes(ele.type)) && (!when || ele.when === when); });
            try {
                for (var checkers2_1 = tslib_1.__values(checkers2), checkers2_1_1 = checkers2_1.next(); !checkers2_1_1.done; checkers2_1_1 = checkers2_1.next()) {
                    var checker = checkers2_1_1.value;
                    var filter = checker.filter;
                    if (filter) {
                        var filterr = typeof filter === 'function' ? filter(operation, context, {}) : filter;
                        (0, assert_1.assert)(!(filter instanceof Promise), "\u5BF9".concat(entity, "\u7684\u52A8\u4F5C").concat(action, "\u4E0A\u5B9A\u4E49\u7684checker\uFF0C\u5176filter\u8FD4\u56DE\u4E86Promise\uFF0C\u8BF7\u6CE8\u610F\u5C06\u540C\u6B65\u548C\u5F02\u6B65\u7684\u8FD4\u56DE\u533A\u5206\u5BF9\u5F85"));
                        var isRepel = (0, filter_1.checkFilterRepel)(entity, context, filterr, operation.filter, true);
                        (0, assert_1.assert)(typeof isRepel === 'boolean');
                        if (isRepel) {
                            continue;
                        }
                    }
                    checker.fn(operation, context, {});
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
    SyncTriggerExecutor.All_Checker_Types = ['data', 'logical', 'logicalRelation', 'relation', 'row'];
    return SyncTriggerExecutor;
}());
exports.default = SyncTriggerExecutor;
