"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Socket = void 0;
// 这里要处理小程序环境下的socketIO，待定
// @ts-ignore
const weapp_socket_io_wx_js_1 = require("./weapp.socket.io.wx.js");
const socket_io_client_1 = require("socket.io-client");
Object.defineProperty(exports, "Socket", { enumerable: true, get: function () { return socket_io_client_1.Socket; } });
exports.default = weapp_socket_io_wx_js_1.io;
