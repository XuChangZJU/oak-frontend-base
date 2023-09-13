/// <reference types="wechat-miniprogram" />
import { PromisefyOption } from '../../types/Wx';
export declare class Bluetooth {
    private serverDict;
    constructor();
    startScanDevice(option: PromisefyOption<WechatMiniprogram.StartBluetoothDevicesDiscoveryOption>): Promise<WechatMiniprogram.BluetoothError>;
    stopScanDevice(): Promise<WechatMiniprogram.BluetoothError>;
    openAdapter(option: PromisefyOption<WechatMiniprogram.OpenBluetoothAdapterOption>): Promise<WechatMiniprogram.BluetoothError>;
    closeAdapter(): Promise<WechatMiniprogram.BluetoothError>;
    onDeviceFound(callback: WechatMiniprogram.OnBluetoothDeviceFoundCallback): void;
    onAdapterStateChanged(callback: WechatMiniprogram.OnBluetoothAdapterStateChangeCallback): void;
    offDeviceFound(callback: WechatMiniprogram.OnBluetoothDeviceFoundCallback): void;
    offAdapterStateChaned(callback: WechatMiniprogram.OnBluetoothAdapterStateChangeCallback): void;
    getConnectedDevices(option: PromisefyOption<WechatMiniprogram.GetConnectedBluetoothDevicesOption>): Promise<WechatMiniprogram.GetConnectedBluetoothDevicesSuccessCallbackResult>;
    getDevices(): Promise<WechatMiniprogram.GetBluetoothDevicesSuccessCallbackResult>;
    getAdapterState(): Promise<WechatMiniprogram.GetBluetoothAdapterStateSuccessCallbackResult>;
    writeBLECharacteristicValue(option: PromisefyOption<WechatMiniprogram.WriteBLECharacteristicValueOption>): Promise<WechatMiniprogram.BluetoothError>;
    readBLECharacteristicValue(option: PromisefyOption<WechatMiniprogram.ReadBLECharacteristicValueOption>): Promise<WechatMiniprogram.BluetoothError>;
    onBLEConnectionStateChange(callback: WechatMiniprogram.OnBLEConnectionStateChangeCallback): void;
    onBLECharacteristicValueChange(callback: WechatMiniprogram.OnBLECharacteristicValueChangeCallback): void;
    offBLEConnectionStateChange(callback: WechatMiniprogram.OnBLEConnectionStateChangeCallback): void;
    offBLECharacteristicValueChange(callback: WechatMiniprogram.OnBLECharacteristicValueChangeCallback): void;
    notifyBLECharacteristicValueChange(option: PromisefyOption<WechatMiniprogram.NotifyBLECharacteristicValueChangeOption>): Promise<void>;
    getBLEDeviceServices(option: PromisefyOption<WechatMiniprogram.GetBLEDeviceServicesOption>): Promise<WechatMiniprogram.GetBLEDeviceServicesSuccessCallbackResult>;
    getBLEDeviceCharacteristics(option: PromisefyOption<WechatMiniprogram.GetBLEDeviceCharacteristicsOption>): Promise<WechatMiniprogram.GetBLEDeviceCharacteristicsSuccessCallbackResult>;
    createBLEConnection(option: PromisefyOption<WechatMiniprogram.CreateBLEConnectionOption>): Promise<void>;
    closeBLEConnection(option: PromisefyOption<WechatMiniprogram.CloseBLEConnectionOption>): Promise<void>;
    onPeripheralConnectionStateChanged(callback: WechatMiniprogram.OnBLEPeripheralConnectionStateChangedCallback): void;
    offPeripheralConnectionStateChanged(callback: WechatMiniprogram.OnBLEPeripheralConnectionStateChangedCallback): void;
    createPeripheralServer(): Promise<string>;
    closePeripheralServer(id: string): void;
    addPeripheralService(id: string, option: PromisefyOption<WechatMiniprogram.AddServiceOption>): void;
    removePeripheralService(id: string, option: PromisefyOption<WechatMiniprogram.RemoveServiceOption>): void;
    startPeripheralAdvertising(id: string, option: PromisefyOption<WechatMiniprogram.StartAdvertisingObject>): void;
    stopPeripheralAdvertising(id: string): void;
    writePeripheralCharacteristicValue(id: string, option: PromisefyOption<WechatMiniprogram.WriteCharacteristicValueObject>): void;
    onPeripheralCharacteristicReadRequest(id: string, callback: WechatMiniprogram.OnCharacteristicReadRequestCallback): void;
    offPeripheralCharacteristicReadRequest(id: string, callback: WechatMiniprogram.OnCharacteristicReadRequestCallback): void;
    onPeripheralCharacteristicWriteRequest(id: string, callback: WechatMiniprogram.OnCharacteristicWriteRequestCallback): void;
    offPeripheralCharacteristicWriteRequest(id: string, callback: WechatMiniprogram.OnCharacteristicWriteRequestCallback): void;
    onPeripheralCharacteristicSubscribed(id: string, callback: WechatMiniprogram.OnCharacteristicSubscribedCallback): void;
    offPeripheralCharacteristicSubscribed(id: string, callback: WechatMiniprogram.OnCharacteristicSubscribedCallback): void;
    onPeripheralCharacteristicUnsubscribed(id: string, callback: WechatMiniprogram.OnCharacteristicUnsubscribedCallback): void;
    offPeripheralCharacteristicUnsubscribed(id: string, callback: WechatMiniprogram.OnCharacteristicUnsubscribedCallback): void;
}