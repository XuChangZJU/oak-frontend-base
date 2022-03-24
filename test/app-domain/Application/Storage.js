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
        description: {
            type: "text"
        },
        type: {
            type: "varchar",
            params: {
                length: 16
            }
        },
        systemId: {
            type: "ref",
            ref: "system"
        }
    }
};
