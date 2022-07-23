import { unset } from 'oak-domain/lib/utils/lodash';
import { PromisefyOption } from '../types/Wx';

export class Bluetooth {
    private serverDict: Record<string, WechatMiniprogram.BLEPeripheralServer>;

    constructor() {
        this.serverDict = {};
    }
    startScanDevice(option: PromisefyOption<WechatMiniprogram.StartBluetoothDevicesDiscoveryOption>) {
        return wx.startBluetoothDevicesDiscovery(option);
    }

    stopScanDevice() {
        return wx.stopBluetoothDevicesDiscovery({});
    }

    openAdapter(option: PromisefyOption<WechatMiniprogram.OpenBluetoothAdapterOption>) {
        return wx.openBluetoothAdapter(option);
    }

    closeAdapter() {
        return wx.closeBluetoothAdapter({});
    }

    onDeviceFound(callback: WechatMiniprogram.OnBluetoothDeviceFoundCallback) {
        wx.onBluetoothDeviceFound(callback);
    }

    onAdapterStateChanged(callback: WechatMiniprogram.OnBluetoothAdapterStateChangeCallback) {
        wx.onBluetoothAdapterStateChange(callback);
    }

    offDeviceFound(callback: WechatMiniprogram.OnBluetoothDeviceFoundCallback) {
        wx.offBluetoothDeviceFound(callback);
    }

    offAdapterStateChaned(callback: WechatMiniprogram.OnBluetoothAdapterStateChangeCallback) {
        wx.offBluetoothAdapterStateChange(callback);
    }

    getConnectedDevices(option: PromisefyOption<WechatMiniprogram.GetConnectedBluetoothDevicesOption>) {
        return wx.getConnectedBluetoothDevices(option);
    }

    getDevices() {
        return wx.getBluetoothDevices({});
    }

    getAdapterState() {
        return wx.getBluetoothAdapterState({});
    }

    // ble
    writeBLECharacteristicValue(option: PromisefyOption<WechatMiniprogram.WriteBLECharacteristicValueOption>) {
        return wx.writeBLECharacteristicValue(option);
    }

    readBLECharacteristicValue(option: PromisefyOption<WechatMiniprogram.ReadBLECharacteristicValueOption>) {
        return wx.readBLECharacteristicValue(option);
    }

    onBLEConnectionStateChange(callback: WechatMiniprogram.OnBLEConnectionStateChangeCallback) {
        wx.onBLEConnectionStateChange(callback);
    }

    onBLECharacteristicValueChange(callback: WechatMiniprogram.OnBLECharacteristicValueChangeCallback) {
        wx.onBLECharacteristicValueChange(callback);
    }

    offBLEConnectionStateChange(callback: WechatMiniprogram.OnBLEConnectionStateChangeCallback) {
        wx.offBLEConnectionStateChange(callback);
    }

    offBLECharacteristicValueChange(callback: WechatMiniprogram.OnBLECharacteristicValueChangeCallback) {
        wx.offBLECharacteristicValueChange(callback);
    }

    notifyBLECharacteristicValueChange(option: PromisefyOption<WechatMiniprogram.NotifyBLECharacteristicValueChangeOption>) {
        wx.notifyBLECharacteristicValueChange(option);
    }

    getBLEDeviceServices(option: PromisefyOption<WechatMiniprogram.GetBLEDeviceServicesOption>) {
        return wx.getBLEDeviceServices(option);
    }

    getBLEDeviceCharacteristics(option: PromisefyOption<WechatMiniprogram.GetBLEDeviceCharacteristicsOption>) {
        return wx.getBLEDeviceCharacteristics(option);
    }

    createBLEConnection(option: PromisefyOption<WechatMiniprogram.CreateBLEConnectionOption>) {
        return wx.createBLEConnection(option);
    }

    closeBLEConnection(option: PromisefyOption<WechatMiniprogram.CloseBLEConnectionOption>) {
        return wx.closeBLEConnection(option);
    }

    // peripheral
    onPeripheralConnectionStateChanged(callback: WechatMiniprogram.OnBLEPeripheralConnectionStateChangedCallback) {
        wx.onBLEPeripheralConnectionStateChanged(callback);
    }

    offPeripheralConnectionStateChanged(callback: WechatMiniprogram.OnBLEPeripheralConnectionStateChangedCallback) {
        wx.offBLEPeripheralConnectionStateChanged(callback);
    }

    async createPeripheralServer() {
        const server = await wx.createBLEPeripheralServer({});
        const id = await generateNewId();
        Object.assign(this.serverDict, {
            [id]: server,
        });
        return id;
    }

    closePeripheralServer(id: string) {
        const server = this.serverDict[id];
        server.close();
        unset(this.serverDict, id);
    }

    addPeripheralService(id: string, option: PromisefyOption<WechatMiniprogram.AddServiceOption>) {
        const server = this.serverDict[id];
        server.addService(option);
    }

    removePeripheralService(id: string, option: PromisefyOption<WechatMiniprogram.RemoveServiceOption>) {
        const server = this.serverDict[id];
        return server.removeService(option);
    }

    startPeripheralAdvertising(id: string, option: PromisefyOption<WechatMiniprogram.StartAdvertisingObject>) {
        const server = this.serverDict[id];
        return server.startAdvertising(option);
    }

    stopPeripheralAdvertising(id: string) {
        const server = this.serverDict[id];
        return server.stopAdvertising();
    }

    writePeripheralCharacteristicValue(id: string, option: PromisefyOption<WechatMiniprogram.WriteCharacteristicValueObject>) {
        const server = this.serverDict[id];
        return server.writeCharacteristicValue(option);
    }

    onPeripheralCharacteristicReadRequest(id: string, callback: WechatMiniprogram.OnCharacteristicReadRequestCallback) {
        const server = this.serverDict[id];
        server.onCharacteristicReadRequest(callback);
    }

    offPeripheralCharacteristicReadRequest(id: string, callback: WechatMiniprogram.OnCharacteristicReadRequestCallback) {
        const server = this.serverDict[id];
        server.offCharacteristicReadRequest(callback);
    }

    onPeripheralCharacteristicWriteRequest(id: string, callback: WechatMiniprogram.OnCharacteristicWriteRequestCallback) {
        const server = this.serverDict[id];
        server.onCharacteristicWriteRequest(callback);
    }

    offPeripheralCharacteristicWriteRequest(id: string, callback: WechatMiniprogram.OnCharacteristicWriteRequestCallback) {
        const server = this.serverDict[id];
        server.offCharacteristicWriteRequest(callback);
    }

    onPeripheralCharacteristicSubscribed(id: string, callback: WechatMiniprogram.OnCharacteristicSubscribedCallback) {
        const server = this.serverDict[id];
        server.onCharacteristicSubscribed(callback);
    }

    offPeripheralCharacteristicSubscribed(id: string, callback: WechatMiniprogram.OnCharacteristicSubscribedCallback) {
        const server = this.serverDict[id];
        server.offCharacteristicSubscribed(callback);
    }

    onPeripheralCharacteristicUnsubscribed(id: string, callback: WechatMiniprogram.OnCharacteristicUnsubscribedCallback) {
        const server = this.serverDict[id];
        server.onCharacteristicUnsubscribed(callback);
    }

    offPeripheralCharacteristicUnsubscribed(id: string, callback: WechatMiniprogram.OnCharacteristicUnsubscribedCallback) {
        const server = this.serverDict[id];
        server.offCharacteristicUnsubscribed(callback);
    }
}
