"use strict";
exports.__esModule = true;
exports.desc = void 0;
exports.desc = {
    attributes: {
        district: {
            type: "varchar",
            params: {
                width: 16
            }
        },
        areaId: {
            type: "ref",
            ref: "area"
        },
        ownerId: {
            type: "ref",
            ref: "user"
        }
    }
};
