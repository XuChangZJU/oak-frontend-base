"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bluetooth = void 0;
var tslib_1 = require("tslib");
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result, errCode, errMsg;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, wx.notifyBLECharacteristicValueChange(option)];
                    case 1:
                        result = _a.sent();
                        if (result.errCode !== 0) {
                            errCode = result.errCode, errMsg = result.errMsg;
                            throw new Error("[".concat(errCode, "]").concat(errMsg));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Bluetooth.prototype.getBLEDeviceServices = function (option) {
        return wx.getBLEDeviceServices(option);
    };
    Bluetooth.prototype.getBLEDeviceCharacteristics = function (option) {
        return wx.getBLEDeviceCharacteristics(option);
    };
    Bluetooth.prototype.createBLEConnection = function (option) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result, errCode, errMsg;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, wx.createBLEConnection(option)];
                    case 1:
                        result = _a.sent();
                        if (result.errCode !== 0) {
                            errCode = result.errCode, errMsg = result.errMsg;
                            throw new Error("[".concat(errCode, "]").concat(errMsg));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Bluetooth.prototype.closeBLEConnection = function (option) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result, errCode, errMsg;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, wx.closeBLEConnection(option)];
                    case 1:
                        result = _a.sent();
                        if (result.errCode !== 0) {
                            errCode = result.errCode, errMsg = result.errMsg;
                            throw new Error("[".concat(errCode, "]").concat(errMsg));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // peripheral
    Bluetooth.prototype.onPeripheralConnectionStateChanged = function (callback) {
        wx.onBLEPeripheralConnectionStateChanged(callback);
    };
    Bluetooth.prototype.offPeripheralConnectionStateChanged = function (callback) {
        wx.offBLEPeripheralConnectionStateChanged(callback);
    };
    Bluetooth.prototype.createPeripheralServer = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var server, id;
            var _a;
            return tslib_1.__generator(this, function (_b) {
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
