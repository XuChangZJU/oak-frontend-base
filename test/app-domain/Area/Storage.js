"use strict";
exports.__esModule = true;
exports.desc = void 0;
exports.desc = {
    attributes: {
        name: {
            type: "varchar",
            params: {
                width: 32
            }
        },
        level: {
            type: "varchar",
            params: {
                length: 16
            }
        },
        parentId: {
            type: "ref",
            ref: "area"
        },
        code: {
            type: "varchar",
            params: {
                width: 12
            }
        }
    }
};
