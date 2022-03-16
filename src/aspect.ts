import { DebugStore, Context } from "oak-debug-store";
import { Aspect } from "oak-domain/lib/types/Aspect";
import { RunningContext } from "oak-domain/lib/types/Context";
import { EntityDef } from "oak-domain/lib/types/Entity";

import { loginMp } from './aspects/token';

export function makeAspectDict<ED extends {
    [K: string]: EntityDef;
}>(aspects: Array<Aspect<ED>>, store: DebugStore<ED>) {    
    if (process.env.NODE_ENV === 'production') {
        // 生产环境调服务器端函数
    }
    else {
        const runningContext: RunningContext<ED> = {
            application: {
                name: "",
                description: "",
                type: "web",
                system: {
                    name: "",
                    description: "",
                    config: undefined
                },
                dd: []
            },
            rowStore: store,
            on: function (event: "commit" | "rollback", callback: (context: Context<ED>) => Promise<void>): void {
                throw new Error("Function not implemented.");
            },
            begin: function (options?: object): Promise<void> {
                throw new Error("Function not implemented.");
            },
            commit: function (): Promise<void> {
                throw new Error("Function not implemented.");
            },
            rollback: function (): Promise<void> {
                throw new Error("Function not implemented.");
            }
        }
    }
}