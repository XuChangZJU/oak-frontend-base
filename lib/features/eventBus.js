"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
var Feature_1 = require("../types/Feature");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var EventBus = /** @class */ (function (_super) {
    __extends(EventBus, _super);
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
                for (var _b = __values(this.EventTable[type]), _c = _b.next(); !_c.done; _c = _b.next()) {
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
