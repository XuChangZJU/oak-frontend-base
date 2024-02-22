// 这里要处理小程序环境下的socketIO，待定
// @ts-ignore
import { io } from './weapp.socket.io.wx.js';
import { Socket } from "socket.io-client";
export default io;
export { Socket, };
