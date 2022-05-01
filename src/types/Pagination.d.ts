export interface Pagination {
    step: number;
    append: boolean;
    indexFrom: number;
    more: boolean;
    total?: number;
}
