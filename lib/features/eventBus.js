"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
var tslib_1 = require("tslib");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var Feature_1 = require("../types/Feature");
var EventBus = /** @class */ (function (_super) {
    tslib_1.__extends(EventBus, _super);
    function EventBus() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.EventTable = {};
        return _this;
    }
    EventBus.prototype.sub = function (type, callback) {
        var _a;
        if (this.EventTable[type]) {
            this.EventTable[type].push(callback);
        }
        else {
            Object.assign(this.EventTable, (_a = {},
                _a[type] = [callback],
                _a));
        }
    };
    EventBus.prototype.unsub = function (type, callback) {
        (0, lodash_1.pull)(this.EventTable[type], callback);
    };
    EventBus.prototype.unsubAll = function (type) {
        (0, lodash_1.unset)(this.EventTable, type);
    };
    EventBus.prototype.pub = function (type, options) {
        var e_1, _a;
        if (this.EventTable[type]) {
            try {
                for (var _b = tslib_1.__values(this.EventTable[type]), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var f = _c.value;
                    f(options);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    };
    return EventBus;
}(Feature_1.Feature));
exports.EventBus = EventBus;
