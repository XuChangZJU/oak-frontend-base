export declare class Location {
    get(params?: any): Promise<any>;
    refresh(): void;
}
export declare type Action = {
    refresh: Location['refresh'];
};
