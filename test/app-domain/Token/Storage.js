"use strict";
exports.__esModule = true;
exports.desc = void 0;
exports.desc = {
    attributes: {
        applicationId: {
            type: "ref",
            ref: "application"
        },
        entity: {
            type: "varchar",
            params: {
                width: 32
            }
        },
        entityId: {
            type: "varchar",
            params: {
                width: 64
            }
        },
        userId: {
            type: "ref",
            ref: "user"
        },
        playerId: {
            type: "ref",
            ref: "user"
        },
        ableState: {
            type: "varchar",
            params: {
                length: 16
            }
        }
    }
};
