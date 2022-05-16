import { FileCarrier } from "../types/FileCarrier";

export class WechatMpFileCarrier extends FileCarrier {
    getBytes(): Promise<Uint8Array> {
        throw new Error("Method not implemented.");
    }    
}