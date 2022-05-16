export abstract class FileCarrier {
    abstract getBytes(): Promise<Uint8Array>;
}