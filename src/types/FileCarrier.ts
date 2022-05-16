import { EntityDict, EntityShape } from "oak-domain/lib/types";

export abstract class FileCarrier<ED extends EntityDict, T extends keyof ED> {
    abstract getBytes(): Promise<Uint8Array>;

    abstract upload(entity: T, data: ED[T]['OpSchema']): Promise<void>;
}