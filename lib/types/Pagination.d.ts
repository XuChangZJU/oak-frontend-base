export interface Pagination {
    currentPage: number;
    pageSize: number;
    append?: boolean;
    more: boolean;
    total?: number;
}
