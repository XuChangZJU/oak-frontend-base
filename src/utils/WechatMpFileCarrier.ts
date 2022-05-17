import { EntityDict } from "oak-domain/lib/types";
import { FileCarrier } from "../types/FileCarrier";

export class WechatMpFileCarrier<ED extends EntityDict, T extends keyof ED> extends FileCarrier<ED, T> {
    private file: WechatMiniprogram.MediaFile;
    
    constructor(_file: WechatMiniprogram.MediaFile) {
        super();
        this.file = _file;
    }

    getFile() {
        return this.file;
    }

    getBytes(): Promise<Uint8Array> {
        throw new Error("Method not implemented.");
    }
    upload(entity: T, data: ED[T]["OpSchema"]): Promise<void> {
        throw new Error("Method not implemented.");
    }
      
}