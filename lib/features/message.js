"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
var tslib_1 = require("tslib");
var Feature_1 = require("../types/Feature");
var Message = /** @class */ (function (_super) {
    tslib_1.__extends(Message, _super);
    function Message() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Message.prototype.setMessage = function (data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                this.data = data;
                return [2 /*return*/];
            });
        });
    };
    Message.prototype.consumeMessage = function () {
        var data = this.data;
        this.data = undefined;
        return data;
    };
    tslib_1.__decorate([
        Feature_1.Action
    ], Message.prototype, "setMessage", null);
    return Message;
}(Feature_1.Feature));
exports.Message = Message;
