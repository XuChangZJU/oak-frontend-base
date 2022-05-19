type A = {
    area: object;
    areaId: never,
} | {
    areaId: string;
    area?: number;
}

const a: A = {
    areaId: 'ddd',
    area: {
        bb: 1,
    },
}