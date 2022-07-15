"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const Feature_1 = require("../types/Feature");
class Notification extends Feature_1.Feature {
    data;
    setNotification(data) {
        this.data = data;
    }
    consumeNotification() {
        const data = this.data;
        this.data = undefined;
        return data;
    }
}
__decorate([
    Feature_1.Action
], Notification.prototype, "setNotification", null);
exports.Notification = Notification;
