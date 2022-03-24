"use strict";
exports.__esModule = true;
exports.storageSchema = void 0;
var Storage_1 = require("./Address/Storage");
var Storage_2 = require("./Application/Storage");
var Storage_3 = require("./Area/Storage");
var Storage_4 = require("./ExtraFile/Storage");
var Storage_5 = require("./Mobile/Storage");
var Storage_6 = require("./UserSystem/Storage");
var Storage_7 = require("./System/Storage");
var Storage_8 = require("./Token/Storage");
var Storage_9 = require("./User/Storage");
var Storage_10 = require("./WechatUser/Storage");
var Storage_11 = require("./House/Storage");
exports.storageSchema = {
    address: Storage_1.desc,
    application: Storage_2.desc,
    area: Storage_3.desc,
    extraFile: Storage_4.desc,
    mobile: Storage_5.desc,
    userSystem: Storage_6.desc,
    system: Storage_7.desc,
    token: Storage_8.desc,
    user: Storage_9.desc,
    wechatUser: Storage_10.desc,
    house: Storage_11.desc
};
