import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import assert from 'assert';
import { assign } from "lodash";
import { EntityDef } from "oak-domain/lib/types/Entity";

export interface RunningNode<ED extends {
    [K: string]: EntityDef;
}, T extends keyof ED> {
    entity: T;
    filters?: Array<ED[T]['Selection']['filter']>;
    sorter?: ED[T]['Selection']['sorter'];
    ids?: string[];
    data?: Record<string, Partial<ED[T]['OpSchema']>>;
    action?: ED[T]['Action'];
    children?: Record<string, RunningNode<ED, keyof ED>>;
};

type InitialState<ED extends {
    [K: string]: EntityDef;
}> = Record<string, RunningNode<ED, keyof ED>>;


export function initialize<ED extends {
    [K: string]: EntityDef;
}>() {
    const initialState: InitialState<ED> = {};
    const slice = createSlice({
        name: 'runningNode',
        initialState,
        reducers: {
            createRunningNode: (state, action: PayloadAction<{
                parent?: RunningNode<ED, keyof ED>;
                path: string;
                node: RunningNode<ED, keyof ED>;
            }>) => {
                const { path, parent, node } = action.payload;
                const paths = path.split('.');
                if (parent) {
                    let current = parent;
                    for (const p of paths) {
                        if (current.children![p]) {
                            current = current.children![p];
                            continue;
                        }
                    }
                    assert(false);
                }
                else {
                    assert(paths.length === 1);
                    assert(!state[path]);
                    assert(node.entity);
                    assign(state, {
                        [path]: node,
                    });
                }
            }
        }
    });

    const actions = {
        ...slice.actions,
    };
    return {
        slice,
        actions,
    }
};