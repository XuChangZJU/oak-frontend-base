"use strict";
exports.__esModule = true;
exports.desc = void 0;
exports.desc = {
    attributes: {
        userId: {
            type: "ref",
            ref: "user"
        },
        systemId: {
            type: "ref",
            ref: "system"
        },
        relation: {
            type: "varchar",
            params: {
                length: 16
            }
        }
    }
};