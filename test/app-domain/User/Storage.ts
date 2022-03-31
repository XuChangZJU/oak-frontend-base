import { StorageDesc } from "oak-domain/lib/types/Storage";
import { OpSchema } from "./Schema";
export const desc: StorageDesc<OpSchema> = {
    attributes: {
        name: {
            type: "varchar",
            params: {
                width: 16
            }
        },
        nickname: {
            type: "varchar",
            params: {
                width: 64
            }
        },
        password: {
            type: "text"
        },
        birth: {
            type: "datetime"
        },
        gender: {
            type: "varchar",
            params: {
                length: 16
            }
        },
        avatar: {
            type: "text"
        },
        idCardType: {
            type: "varchar",
            params: {
                length: 16
            }
        },
        idNumber: {
            type: "varchar",
            params: {
                width: 32
            }
        },
        refId: {
            type: "ref",
            ref: "user"
        },
        userState: {
            type: "varchar",
            params: {
                length: 16
            }
        },
        idState: {
            type: "varchar",
            params: {
                length: 16
            }
        }
    },
    indexes: [
        {
            name: 'index_test2',
            attributes: [
                {
                    name: 'birth',
                    direction: 'ASC'
                },
            ]
        },
        {
            name: 'index_test',
            attributes: [
                {
                    name: 'name'
                },
                {
                    name: 'nickname'
                }
            ],
            config: {
                type: 'fulltext',
                parser: 'ngram'
            }
        }
    ]
};