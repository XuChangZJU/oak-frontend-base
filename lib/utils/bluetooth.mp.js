"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bluetooth = void 0;
const lodash_1 = require("lodash");
/**
 * Bluetooth不用action重渲染，用监听回调的方式处理数据变化吧
 */
class Bluetooth {
    serverDict;
    constructor() {
        this.serverDict = {};
    }
    startScanDevice(option) {
        return wx.startBluetoothDevicesDiscovery(option);
    }
    stopScanDevice() {
        return wx.stopBluetoothDevicesDiscovery({});
    }
    openAdapter(option) {
        return wx.openBluetoothAdapter(option);
    }
    closeAdapter() {
        return wx.closeBluetoothAdapter({});
    }
    onDeviceFound(callback) {
        wx.onBluetoothDeviceFound(callback);
    }
    onAdapterStateChanged(callback) {
        wx.onBluetoothAdapterStateChange(callback);
    }
    offDeviceFound(callback) {
        wx.offBluetoothDeviceFound(callback);
    }
    offAdapterStateChaned(callback) {
        wx.offBluetoothAdapterStateChange(callback);
    }
    getConnectedDevices(option) {
        return wx.getConnectedBluetoothDevices(option);
    }
    getDevices() {
        return wx.getBluetoothDevices({});
    }
    getAdapterState() {
        return wx.getBluetoothAdapterState({});
    }
    // ble
    writeBLECharacteristicValue(option) {
        return wx.writeBLECharacteristicValue(option);
    }
    readBLECharacteristicValue(option) {
        return wx.readBLECharacteristicValue(option);
    }
    onBLEConnectionStateChange(callback) {
        wx.onBLEConnectionStateChange(callback);
    }
    onBLECharacteristicValueChange(callback) {
        wx.onBLECharacteristicValueChange(callback);
    }
    offBLEConnectionStateChange(callback) {
        wx.offBLEConnectionStateChange(callback);
    }
    offBLECharacteristicValueChange(callback) {
        wx.offBLECharacteristicValueChange(callback);
    }
    notifyBLECharacteristicValueChange(option) {
        wx.notifyBLECharacteristicValueChange(option);
    }
    getBLEDeviceServices(option) {
        return wx.getBLEDeviceServices(option);
    }
    getBLEDeviceCharacteristics(option) {
        return wx.getBLEDeviceCharacteristics(option);
    }
    createBLEConnection(option) {
        return wx.createBLEConnection(option);
    }
    closeBLEConnection(option) {
        return wx.closeBLEConnection(option);
    }
    // peripheral
    onPeripheralConnectionStateChanged(callback) {
        wx.onBLEPeripheralConnectionStateChanged(callback);
    }
    offPeripheralConnectionStateChanged(callback) {
        wx.offBLEPeripheralConnectionStateChanged(callback);
    }
    async createPeripheralServer() {
        const server = await wx.createBLEPeripheralServer({});
        const id = await generateNewId();
        (0, lodash_1.assign)(this.serverDict, {
            [id]: server,
        });
        return id;
    }
    closePeripheralServer(id) {
        const server = this.serverDict[id];
        server.close();
        (0, lodash_1.unset)(this.serverDict, id);
    }
    addPeripheralService(id, option) {
        const server = this.serverDict[id];
        server.addService(option);
    }
    removePeripheralService(id, option) {
        const server = this.serverDict[id];
        return server.removeService(option);
    }
    startPeripheralAdvertising(id, option) {
        const server = this.serverDict[id];
        return server.startAdvertising(option);
    }
    stopPeripheralAdvertising(id) {
        const server = this.serverDict[id];
        return server.stopAdvertising();
    }
    writePeripheralCharacteristicValue(id, option) {
        const server = this.serverDict[id];
        return server.writeCharacteristicValue(option);
    }
    onPeripheralCharacteristicReadRequest(id, callback) {
        const server = this.serverDict[id];
        server.onCharacteristicReadRequest(callback);
    }
    offPeripheralCharacteristicReadRequest(id, callback) {
        const server = this.serverDict[id];
        server.offCharacteristicReadRequest(callback);
    }
    onPeripheralCharacteristicWriteRequest(id, callback) {
        const server = this.serverDict[id];
        server.onCharacteristicWriteRequest(callback);
    }
    offPeripheralCharacteristicWriteRequest(id, callback) {
        const server = this.serverDict[id];
        server.offCharacteristicWriteRequest(callback);
    }
    onPeripheralCharacteristicSubscribed(id, callback) {
        const server = this.serverDict[id];
        server.onCharacteristicSubscribed(callback);
    }
    offPeripheralCharacteristicSubscribed(id, callback) {
        const server = this.serverDict[id];
        server.offCharacteristicSubscribed(callback);
    }
    onPeripheralCharacteristicUnsubscribed(id, callback) {
        const server = this.serverDict[id];
        server.onCharacteristicUnsubscribed(callback);
    }
    offPeripheralCharacteristicUnsubscribed(id, callback) {
        const server = this.serverDict[id];
        server.offCharacteristicUnsubscribed(callback);
    }
}
exports.Bluetooth = Bluetooth;
