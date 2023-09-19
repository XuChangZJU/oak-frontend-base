"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const Feature_1 = require("../types/Feature");
class Notification extends Feature_1.Feature {
    data;
    setNotification(data) {
        this.data = data;
        this.publish();
    }
    consumeNotification() {
        const data = this.data;
        this.data = undefined;
        return data;
    }
}
exports.Notification = Notification;
