"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
var tslib_1 = require("tslib");
var Feature_1 = require("../types/Feature");
var Notification = /** @class */ (function (_super) {
    tslib_1.__extends(Notification, _super);
    function Notification() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Notification.prototype.setNotification = function (data) {
        this.data = data;
        this.publish();
    };
    Notification.prototype.consumeNotification = function () {
        var data = this.data;
        this.data = undefined;
        return data;
    };
    return Notification;
}(Feature_1.Feature));
exports.Notification = Notification;
