"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontContext = void 0;
const oak_memory_tree_store_1 = require("oak-memory-tree-store");
class FrontContext extends oak_memory_tree_store_1.Context {
    topAction = true;
}
exports.FrontContext = FrontContext;
;
