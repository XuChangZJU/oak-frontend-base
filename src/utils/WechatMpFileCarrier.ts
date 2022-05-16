import { EntityDict } from "oak-domain/lib/types";
import { FileCarrier } from "../types/FileCarrier";

export class WechatMpFileCarrier<ED extends EntityDict, T extends keyof ED> extends FileCarrier<ED, T> {
    getBytes(): Promise<Uint8Array> {
        throw new Error("Method not implemented.");
    }
    upload(entity: T, data: ED[T]["OpSchema"]): Promise<void> {
        throw new Error("Method not implemented.");
    }
      
}