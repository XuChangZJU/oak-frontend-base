import { unset } from 'oak-domain/lib/utils/lodash';
import { generateNewId } from 'oak-domain/lib/utils/uuid';
export class Bluetooth {
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
    async notifyBLECharacteristicValueChange(option) {
        const result = await wx.notifyBLECharacteristicValueChange(option);
        if (result.errCode !== 0) {
            const { errCode, errMsg } = result;
            throw new Error(`[${errCode}]${errMsg}`);
        }
    }
    getBLEDeviceServices(option) {
        return wx.getBLEDeviceServices(option);
    }
    getBLEDeviceCharacteristics(option) {
        return wx.getBLEDeviceCharacteristics(option);
    }
    async createBLEConnection(option) {
        const result = await wx.createBLEConnection(option);
        if (result.errCode !== 0) {
            const { errCode, errMsg } = result;
            throw new Error(`[${errCode}]${errMsg}`);
        }
    }
    async closeBLEConnection(option) {
        const result = await wx.closeBLEConnection(option);
        if (result.errCode !== 0) {
            const { errCode, errMsg } = result;
            throw new Error(`[${errCode}]${errMsg}`);
        }
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
        const id = generateNewId();
        Object.assign(this.serverDict, {
            [id]: server,
        });
        return id;
    }
    closePeripheralServer(id) {
        const server = this.serverDict[id];
        server.close();
        unset(this.serverDict, id);
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
