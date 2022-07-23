"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bluetooth = void 0;
var lodash_1 = require("oak-domain/lib/utils/lodash");
var Bluetooth = /** @class */ (function () {
    function Bluetooth() {
        this.serverDict = {};
    }
    Bluetooth.prototype.startScanDevice = function (option) {
        return wx.startBluetoothDevicesDiscovery(option);
    };
    Bluetooth.prototype.stopScanDevice = function () {
        return wx.stopBluetoothDevicesDiscovery({});
    };
    Bluetooth.prototype.openAdapter = function (option) {
        return wx.openBluetoothAdapter(option);
    };
    Bluetooth.prototype.closeAdapter = function () {
        return wx.closeBluetoothAdapter({});
    };
    Bluetooth.prototype.onDeviceFound = function (callback) {
        wx.onBluetoothDeviceFound(callback);
    };
    Bluetooth.prototype.onAdapterStateChanged = function (callback) {
        wx.onBluetoothAdapterStateChange(callback);
    };
    Bluetooth.prototype.offDeviceFound = function (callback) {
        wx.offBluetoothDeviceFound(callback);
    };
    Bluetooth.prototype.offAdapterStateChaned = function (callback) {
        wx.offBluetoothAdapterStateChange(callback);
    };
    Bluetooth.prototype.getConnectedDevices = function (option) {
        return wx.getConnectedBluetoothDevices(option);
    };
    Bluetooth.prototype.getDevices = function () {
        return wx.getBluetoothDevices({});
    };
    Bluetooth.prototype.getAdapterState = function () {
        return wx.getBluetoothAdapterState({});
    };
    // ble
    Bluetooth.prototype.writeBLECharacteristicValue = function (option) {
        return wx.writeBLECharacteristicValue(option);
    };
    Bluetooth.prototype.readBLECharacteristicValue = function (option) {
        return wx.readBLECharacteristicValue(option);
    };
    Bluetooth.prototype.onBLEConnectionStateChange = function (callback) {
        wx.onBLEConnectionStateChange(callback);
    };
    Bluetooth.prototype.onBLECharacteristicValueChange = function (callback) {
        wx.onBLECharacteristicValueChange(callback);
    };
    Bluetooth.prototype.offBLEConnectionStateChange = function (callback) {
        wx.offBLEConnectionStateChange(callback);
    };
    Bluetooth.prototype.offBLECharacteristicValueChange = function (callback) {
        wx.offBLECharacteristicValueChange(callback);
    };
    Bluetooth.prototype.notifyBLECharacteristicValueChange = function (option) {
        wx.notifyBLECharacteristicValueChange(option);
    };
    Bluetooth.prototype.getBLEDeviceServices = function (option) {
        return wx.getBLEDeviceServices(option);
    };
    Bluetooth.prototype.getBLEDeviceCharacteristics = function (option) {
        return wx.getBLEDeviceCharacteristics(option);
    };
    Bluetooth.prototype.createBLEConnection = function (option) {
        return wx.createBLEConnection(option);
    };
    Bluetooth.prototype.closeBLEConnection = function (option) {
        return wx.closeBLEConnection(option);
    };
    // peripheral
    Bluetooth.prototype.onPeripheralConnectionStateChanged = function (callback) {
        wx.onBLEPeripheralConnectionStateChanged(callback);
    };
    Bluetooth.prototype.offPeripheralConnectionStateChanged = function (callback) {
        wx.offBLEPeripheralConnectionStateChanged(callback);
    };
    Bluetooth.prototype.createPeripheralServer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var server, id;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, wx.createBLEPeripheralServer({})];
                    case 1:
                        server = _b.sent();
                        return [4 /*yield*/, generateNewId()];
                    case 2:
                        id = _b.sent();
                        Object.assign(this.serverDict, (_a = {},
                            _a[id] = server,
                            _a));
                        return [2 /*return*/, id];
                }
            });
        });
    };
    Bluetooth.prototype.closePeripheralServer = function (id) {
        var server = this.serverDict[id];
        server.close();
        (0, lodash_1.unset)(this.serverDict, id);
    };
    Bluetooth.prototype.addPeripheralService = function (id, option) {
        var server = this.serverDict[id];
        server.addService(option);
    };
    Bluetooth.prototype.removePeripheralService = function (id, option) {
        var server = this.serverDict[id];
        return server.removeService(option);
    };
    Bluetooth.prototype.startPeripheralAdvertising = function (id, option) {
        var server = this.serverDict[id];
        return server.startAdvertising(option);
    };
    Bluetooth.prototype.stopPeripheralAdvertising = function (id) {
        var server = this.serverDict[id];
        return server.stopAdvertising();
    };
    Bluetooth.prototype.writePeripheralCharacteristicValue = function (id, option) {
        var server = this.serverDict[id];
        return server.writeCharacteristicValue(option);
    };
    Bluetooth.prototype.onPeripheralCharacteristicReadRequest = function (id, callback) {
        var server = this.serverDict[id];
        server.onCharacteristicReadRequest(callback);
    };
    Bluetooth.prototype.offPeripheralCharacteristicReadRequest = function (id, callback) {
        var server = this.serverDict[id];
        server.offCharacteristicReadRequest(callback);
    };
    Bluetooth.prototype.onPeripheralCharacteristicWriteRequest = function (id, callback) {
        var server = this.serverDict[id];
        server.onCharacteristicWriteRequest(callback);
    };
    Bluetooth.prototype.offPeripheralCharacteristicWriteRequest = function (id, callback) {
        var server = this.serverDict[id];
        server.offCharacteristicWriteRequest(callback);
    };
    Bluetooth.prototype.onPeripheralCharacteristicSubscribed = function (id, callback) {
        var server = this.serverDict[id];
        server.onCharacteristicSubscribed(callback);
    };
    Bluetooth.prototype.offPeripheralCharacteristicSubscribed = function (id, callback) {
        var server = this.serverDict[id];
        server.offCharacteristicSubscribed(callback);
    };
    Bluetooth.prototype.onPeripheralCharacteristicUnsubscribed = function (id, callback) {
        var server = this.serverDict[id];
        server.onCharacteristicUnsubscribed(callback);
    };
    Bluetooth.prototype.offPeripheralCharacteristicUnsubscribed = function (id, callback) {
        var server = this.serverDict[id];
        server.offCharacteristicUnsubscribed(callback);
    };
    return Bluetooth;
}());
exports.Bluetooth = Bluetooth;
