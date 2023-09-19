"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Socket = void 0;
const socket_io_client_1 = require("socket.io-client");
Object.defineProperty(exports, "Socket", { enumerable: true, get: function () { return socket_io_client_1.Socket; } });
exports.default = socket_io_client_1.io;
