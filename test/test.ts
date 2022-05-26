type A = {
    area: object;
    areaId: never,
} | {
    areaId: string;
    area?: number;
}
